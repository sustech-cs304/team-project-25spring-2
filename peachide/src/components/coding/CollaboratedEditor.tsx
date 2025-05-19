"use client";

import React, { useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from '@/lib/y-monaco';
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
    wsUrl: string;
    language?: string;
    onUsersChange?: (roomName: string, users: UserInfo[]) => void;
    roomName?: string;
}

const CollaboratedEditorComponent: React.FC<CollaboratedEditorProps> = ({
    wsUrl,
    language = 'javascript',
    onUsersChange,
    roomName = 'monaco-react-2',
}) => {
    const monacoRef = useRef<any>(null);
    const { theme } = useTheme();
    const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const { userData } = useUserContext();

    const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: any) => {
        setEditorRef(editor);
        monacoRef.current = monaco;
        setTimeout(() => {
            const action = editor?.getAction("editor.action.formatDocument");
            action?.run();
        }, 300);
    }, []);

    useEffect(() => {
        let yDoc: Y.Doc | null = null;
        let provider: WebsocketProvider | null = null;
        let binding: MonacoBinding | null = null;

        const awarenessChangeHandler = () => {
            if (!provider) return;
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
            onUsersChange?.(roomName, currentUsers);
        };
        
        if (editorRef) {
            yDoc = new Y.Doc();
            const yText = yDoc.getText("content");
            provider = new WebsocketProvider(wsUrl, roomName, yDoc);
            providerRef.current = provider;
            
            const userColor = getRandomUserColor();
            provider.awareness.setLocalStateField('user', {
                name: userData?.name || 'User ' + Math.floor(Math.random() * 100),
                color: userColor,
                avatar: userData?.photo
            });
            provider.awareness.on('change', awarenessChangeHandler);
            
            binding = new MonacoBinding(
                yText,
                editorRef.getModel() as editor.ITextModel,
                new Set([editorRef]),
                provider.awareness
            );
            bindingRef.current = binding;
        }

        const currentProvider = providerRef.current;
        const currentYDoc = yDoc;

        return () => {
            if (currentProvider) {
                currentProvider.awareness.off('change', awarenessChangeHandler);
            }

            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }

            if (currentProvider) {
                 currentProvider.disconnect();
                 providerRef.current = null;
            }

            if (currentYDoc) {
                currentYDoc.destroy();
            }
            
            onUsersChange?.(roomName, []);
            cleanupCursorStyles();
        };
    }, [editorRef, roomName, wsUrl, onUsersChange, userData?.name, userData?.photo]);

    return (
        <div style={{ height: '100%' }}>
            <Editor
                height="100%"
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                language={language}
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