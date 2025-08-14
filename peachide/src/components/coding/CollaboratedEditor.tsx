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
    environmentId?: string;
}

const STORAGE_PREFIX = 'codecontent:';

const getContentStorageKey = (envId: string | undefined, roomName: string) =>
    `${STORAGE_PREFIX}${envId || 'default'}:${roomName}`;

const CollaboratedEditorComponent: React.FC<CollaboratedEditorProps> = ({
    wsUrl,
    language = 'javascript',
    onUsersChange,
    roomName = 'monaco-react-2',
    environmentId,
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
        let yText: Y.Text | null = null;
        let saveTimer: any = null;

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
            yText = yDoc.getText("content");

            // Load initial content from localStorage
            try {
                const key = getContentStorageKey(environmentId, roomName);
                const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
                if (raw && yText.length === 0) {
                    yText.insert(0, raw);
                }
            } catch {}

            // Setup websocket provider (collaboration) but allow offline usage
            try {
                provider = new WebsocketProvider(wsUrl, roomName, yDoc);
            } catch (e) {
                provider = null;
            }
            providerRef.current = provider;
            
            if (provider) {
                const userColor = getRandomUserColor();
                provider.awareness.setLocalStateField('user', {
                    name: userData?.name || 'User ' + Math.floor(Math.random() * 100),
                    color: userColor,
                    avatar: userData?.photo
                });
                provider.awareness.on('change', awarenessChangeHandler);
            }
            
            binding = new MonacoBinding(
                yText,
                editorRef.getModel() as editor.ITextModel,
                new Set([editorRef]),
                provider ? provider.awareness : undefined
            );
            bindingRef.current = binding;

            // Persist to localStorage on content changes (debounced)
            const persistContent = () => {
                if (!yText) return;
                const key = getContentStorageKey(environmentId, roomName);
                try {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(key, yText.toString());
                    }
                } catch {}
            };

            const observer = () => {
                if (saveTimer) clearTimeout(saveTimer);
                saveTimer = setTimeout(persistContent, 250);
            };
            yText.observe(observer as any);
        }

        const currentProvider = providerRef.current;
        const currentYDoc = yDoc;
        const currentYText = yText;

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

            if (currentYText) {
                try {
                    const key = getContentStorageKey(environmentId, roomName);
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(key, currentYText.toString());
                    }
                } catch {}
            }

            if (currentYDoc) {
                currentYDoc.destroy();
            }
            
            onUsersChange?.(roomName, []);
            cleanupCursorStyles();
        };
    }, [editorRef, roomName, wsUrl, onUsersChange, userData?.name, userData?.photo, environmentId]);

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