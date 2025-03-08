import React, { useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import hash from 'object-hash';
import { useTheme } from 'next-themes';
import debounce from 'lodash/debounce';

interface MonacoEditorProps {
    initialData: string;
    language?: string;
    setCode: (code: string) => void;
}

const MonacoEditorComponent: React.FC<MonacoEditorProps> = ({
  initialData,
  language = 'javascript',
  setCode,
}) => {
    const initialStates = {
        codeText: initialData
    };
    const [state, setState] = React.useState(initialStates.codeText);
    const handleEditorChange = (value: string | undefined, event: any) => {
        // settingState("codeText", value);
        // value = value.replace(/\n/g, '')
        if (value !== undefined) {
            setState(value);
        }
    };

    // const handleCodeChange = useCallback(
    //     debounce((value: string | undefined) => {
    //         if (value !== undefined) {
    //         setCode(value);
    //         }
    //     }, 300), // 300ms 防抖延迟
    //     []
    // );
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