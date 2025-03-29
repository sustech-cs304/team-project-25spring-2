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
    const handleEditorChange = (value: string | undefined, event: any) => {
        if (value !== undefined) {
            setState(value);
        }
    };
    const { theme } = useTheme();

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
            onMount={(editor, monaco) => {
                setTimeout(function () {
                    if (editor) {
                        const action = editor?.getAction("editor.action.formatDocument");
                        if (action) {
                            action.run();
                        }
                    }
                }, 300);
            }}
        />
    </div>
    );
};

export default MonacoEditorComponent;