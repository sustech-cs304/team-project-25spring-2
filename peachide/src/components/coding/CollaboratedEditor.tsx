"use client";

import React, { useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from '@/lib/y-monaco';
import { useMonaco } from '@monaco-editor/react';
import { editor } from "monaco-editor";
import { updateUserCursorStyle, cleanupCursorStyles, getRandomUserColor } from '@/lib/cursorUtils';
import '@/styles/cursor.css';
import { useUserContext } from '@/app/UserEnvProvider';

const Editor = dynamic(
    () => import('@monaco-editor/react'),
    { ssr: false }
);

export interface UserInfo {
    name: string;
    color: string;
    avatar: string;
}

interface CollaboratedEditorProps {
    initialData: string;
    language?: string;
    onSave?: (content: string) => void;
    onUsersChange?: (roomName: string, users: UserInfo[]) => void;
    roomName?: string;
}

// TODO:
// The cursor is now working, but the style is ugly.
// The style should be improved. (Add Flag for user name)

const CollaboratedEditorComponent: React.FC<CollaboratedEditorProps> = ({
    initialData,
    language = 'javascript',
    onSave,
    onUsersChange,
    roomName = 'monaco-react-2',
}) => {
    const monacoRef = useRef<any>(null);
    const contentRef = useRef<string>(initialData);
    const { theme } = useTheme();
    const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const { userData } = useUserContext();

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

        // 基本样式已在引入的CSS文件中定义
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
            
            // 使用工具函数获取随机用户颜色
            const userColor = getRandomUserColor();
            
            // Set user data in awareness
            provider.awareness.setLocalStateField('user', {
                name: userData?.name || 'User ' + Math.floor(Math.random() * 100),
                color: userColor,
                avatar: userData?.photo
            });
            
            // Update CSS variables when awareness changes
            provider.awareness.on('change', () => {
                const states = provider.awareness.getStates();
                const currentUsers = Array.from(states.values()).map((state) => ({
                    name: state.user?.name || 'User ' + Math.floor(Math.random() * 100),
                    color: state.user?.color,
                    avatar: state.user?.avatar
                }));

                states.forEach((state, clientID) => {
                    if (state.user?.color) {
                        updateUserCursorStyle(clientID, state.user.color, state.user.name);
                    }
                });
                
                // Call the new handler with roomName and current users for this room
                onUsersChange?.(roomName, currentUsers);
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

            // Notify parent that users left this room upon unmount
            onUsersChange?.(roomName, []);

            if (editorRef) {
                editorRef.dispose();
                setEditorRef(undefined);
            }
            yDoc?.destroy();
            provider?.destroy();
            binding?.destroy();
            
            // 使用工具函数清理样式元素
            cleanupCursorStyles();
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