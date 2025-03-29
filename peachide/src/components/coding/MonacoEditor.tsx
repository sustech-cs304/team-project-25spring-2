import React, { useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface MonacoEditorProps {
    initialData: string;
    language?: string;
}

const MonacoEditorComponent: React.FC<MonacoEditorProps> = ({
  initialData,
  language = 'javascript',
}) => {
    const [state, setState] = React.useState(initialData);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const { theme } = useTheme();

    const handleEditorChange = (value: string | undefined, event: any) => {
        if (value !== undefined) {
            setState(value);
        }
    };

    // Handle editor mounting
    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        
        setTimeout(function () {
            if (editor) {
                const action = editor?.getAction("editor.action.formatDocument");
                if (action) {
                    action.run();
                }
            }
        }, 300);
    };

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            // Ensure editor instance is properly disposed
            if (editorRef.current) {
                // We don't call dispose directly on the editor to avoid issues
                // Instead, let Monaco's built-in cleanup handle it
                editorRef.current = null;
            }
        };
    }, []);

    // Handle layout changes detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (editorRef.current) {
                // Force layout update when component becomes visible again
                setTimeout(() => {
                    try {
                        editorRef.current.layout();
                    } catch (err) {
                        // If we get an error here, the editor might have been disposed
                        // We'll just catch and ignore to prevent crashes
                        console.warn("Could not update editor layout:", err);
                    }
                }, 100);
            }
        };

        window.addEventListener('resize', handleVisibilityChange);
        return () => {
            window.removeEventListener('resize', handleVisibilityChange);
        };
    }, []);

    return (
        <div style={{ height: '100%' }}>
        <Editor
            height="100%"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            language={language}
            defaultValue={state}
            onChange={handleEditorChange}
            options={{
                cursorStyle: "line",
                formatOnPaste: true,
                formatOnType: true,
                wordWrap: "on"
                // autoIndent: "full"
            }}
            onMount={handleEditorDidMount}
            keepCurrentModel={false} // Prevent model reuse to avoid disposed service errors
        />
    </div>
    );
};

export default MonacoEditorComponent;