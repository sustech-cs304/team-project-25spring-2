"use client";

import React, { useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from '@/lib/y-monaco';
import { useMonaco } from '@monaco-editor/react';
import { editor } from "monaco-editor";

const Editor = dynamic(
    () => import('@monaco-editor/react'),
    { ssr: false }
);

interface CollaboratedEditorProps {
    initialData: string;
    language?: string;
    onSave?: (content: string) => void;
    roomName?: string;
}

// TODO:
// The cursor is now working, but the style is ugly.
// The style should be improved. (Add Flag for user name)

const CollaboratedEditorComponent: React.FC<CollaboratedEditorProps> = ({
    initialData,
    language = 'javascript',
    onSave,
    roomName = 'monaco-react-2'
}) => {
    const monacoRef = useRef<any>(null);
    const contentRef = useRef<string>(initialData);
    const { theme } = useTheme();
    const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    const handleEditorChange = useCallback((value: string | undefined, event: any) => {
        if (value !== undefined) {
            contentRef.current = value;
        }
    }, []);

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(contentRef.current);
        }
    }, [onSave]);

    const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: any) => {
        setEditorRef(editor);
        monacoRef.current = monaco;

        // Set up save command
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSave();
        });
        
        // Format document
        setTimeout(() => {
            const action = editor?.getAction("editor.action.formatDocument");
            action?.run();
        }, 300);

        // Add CSS for colored cursors
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .yRemoteSelection {
                background-color: var(--user-color, rgb(250, 129, 0, 0.5));
            }
            .yRemoteSelectionHead {
                position: absolute;
                border-left: var(--user-color, orange) solid 2px;
                border-top: var(--user-color, orange) solid 2px;
                border-bottom: var(--user-color, orange) solid 2px;
                height: 100%;
                box-sizing: border-box;
            }
            .yRemoteSelectionHead::after {
                position: absolute;
                content: ' ';
                border: 3px solid var(--user-color, orange);
                border-radius: 4px;
                left: -4px;
                top: -5px;
            }
        `;
        document.head.appendChild(styleElement);
    }, [handleSave]);

    useEffect(() => {
        // Set up WebSocket provider
        let yDoc: Y.Doc
        let provider: WebsocketProvider;
        let binding: MonacoBinding;
        
        if (editorRef) {
            yDoc = new Y.Doc();
            const yText = yDoc.getText("monaco");
            const wsUrl = 'ws://localhost:1234';
            provider = new WebsocketProvider(wsUrl, roomName, yDoc);
            providerRef.current = provider;
            
            // Set up user colors
            const userColors = [
                'rgb(255, 0, 0)', // red
                'rgb(0, 255, 0)', // green
                'rgb(0, 0, 255)', // blue
                'rgb(255, 165, 0)', // orange
                'rgb(128, 0, 128)', // purple
                'rgb(0, 128, 128)', // teal
                'rgb(255, 192, 203)', // pink
                'rgb(255, 255, 0)', // yellow
            ];
            
            // Set random color for current user
            const userColor = userColors[Math.floor(Math.random() * userColors.length)];
            
            // Set user data in awareness
            provider.awareness.setLocalStateField('user', {
                name: 'User ' + Math.floor(Math.random() * 100),
                color: userColor
            });
            
            // Update CSS variables when awareness changes
            provider.awareness.on('change', () => {
                const states = provider.awareness.getStates();
                states.forEach((state, clientID) => {
                    if (state.user?.color) {
                        const color = state.user.color;
                        document.documentElement.style.setProperty(
                            `--user-color-${clientID}`, 
                            color
                        );
                        
                        // Add specific styles for this user's cursor
                        const styleId = `user-style-${clientID}`;
                        let styleEl = document.getElementById(styleId);
                        if (!styleEl) {
                            styleEl = document.createElement('style');
                            styleEl.id = styleId;
                            document.head.appendChild(styleEl);
                        }
                        
                        styleEl.textContent = `
                            .yRemoteSelection-${clientID} {
                                background-color: ${color}50 !important;
                            }
                            .yRemoteSelectionHead-${clientID} {
                                border-left: ${color} solid 2px !important;
                                border-top: ${color} solid 2px !important;
                                border-bottom: ${color} solid 2px !important;
                            }
                            .yRemoteSelectionHead-${clientID}::after {
                                border: 3px solid ${color} !important;
                            }
                        `;
                    }
                });
            });
            
            // Bind Monaco editor to Yjs
            binding = new MonacoBinding(
                yText,
                editorRef.getModel() as editor.ITextModel,
                new Set([editorRef]),
                provider.awareness
            );
            bindingRef.current = binding;
        }

        return () => {
            // Clean up Yjs resources
            if (bindingRef.current) {
                bindingRef.current.destroy();
            }
            
            if (providerRef.current) {
                providerRef.current.disconnect();
            }

            if (editorRef) {
                editorRef.dispose();
                setEditorRef(undefined);
            }
            yDoc?.destroy();
            provider?.destroy();
            binding?.destroy();
            
            // Clean up style elements
            document.querySelectorAll('[id^="user-style-"]').forEach(el => el.remove());
        };
    }, [editorRef, roomName]);

    return (
        <div style={{ height: '100%' }}>
            <Editor
                height="100%"
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                language={language}
                defaultValue={initialData}
                onChange={handleEditorChange}
                options={{
                    cursorStyle: "line",
                    formatOnPaste: true,
                    formatOnType: true,
                    wordWrap: "on",
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                }}
                onMount={handleEditorDidMount}
            />
        </div>
    );
};

export default CollaboratedEditorComponent;