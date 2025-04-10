import React, { useCallback, useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface MonacoEditorProps {
    initialData: string;
    language?: string;
    onSave?: (content: string) => void;
}

const MonacoEditorComponent: React.FC<MonacoEditorProps> = ({
    initialData,
    language = 'javascript',
    onSave
}) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const contentRef = useRef<string>(initialData);
    const { theme } = useTheme();

    const handleEditorChange = useCallback((value: string | undefined, event: any) => {
        if (value !== undefined) {
            contentRef.current = value;
        }
    }, []);

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave(contentRef.current);
            editorRef.current.setValue(contentRef.current);
        }
    }, [onSave]);

    const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            handleSave();
        });
        setTimeout(() => {
            const action = editor?.getAction("editor.action.formatDocument");
            action?.run();
        }, 300);
    }, [handleSave]);

    useEffect(() => {
        const handleResize = () => {
            if (editorRef.current) {
                try {
                editorRef.current.layout();
                } catch (err) {
                console.warn("Could not update editor layout:", err);
                }
            }
        };
      
        const resizeObserver = new ResizeObserver(handleResize);
        const currentEditor = editorRef.current;
        
        if (currentEditor?.getContainerDomNode()) {
            resizeObserver.observe(currentEditor.getContainerDomNode());
        }
      
        return () => {
            resizeObserver.disconnect();
            editorRef.current?.dispose();
            editorRef.current = null;
            monacoRef.current = null;
        };
    }, []);

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
                keepCurrentModel={true}
            />
        </div>
    );
};

export default MonacoEditorComponent;