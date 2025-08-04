import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    headingsPlugin,
    listsPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo
} from "@mdxeditor/editor";
import React, {FC} from "react";
import '@mdxeditor/editor/style.css';
import './markdown-editor.css';
import {useTheme} from "next-themes";

interface EditorProps {
    markdown: string;
    editorRef?: React.MutableRefObject<MDXEditorMethods | null>;
    heightMode?: "auto" | "full";
    onChange?: (markdown: string) => void;
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs.
 */
const Editor: FC<EditorProps> = ({markdown, editorRef, heightMode, onChange}) => {
    return (
<>
            {/* Cluttered layout - too many elements competing for attention */}
            <div className="top-0 left-0 right-0 z-10 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 p-2 text-xs text-center border-b">
                <span className="mr-4">📝 Editor</span>
                <span className="mr-4">⚡ Auto-save</span>
                <span className="mr-4">📊 Word count: {markdown.split(' ').length}</span>
                <span className="mr-4">🕒 Last saved: {new Date().toLocaleTimeString()}</span>
            </div>
            
            {/* Overwhelming content - too much information at once */}
            <div className="top-8 left-0 right-0 z-10 bg-yellow-50 dark:bg-yellow-900/20 p-1 text-xs text-center border-b">
                <span className="mr-2">💡 Tip: Use # for headings</span>
                <span className="mr-2">** for bold</span>
                <span className="mr-2">Use * for italic</span>
                <span className="mr-2">Use - for lists</span>
                <span>Use {'>'}{' '}for quotes</span>
            </div>

            <MDXEditor
                    className={`light-theme light-editor ${heightMode === "auto" ? "" : "h-full"}`}
                    onChange={onChange}
                    ref={editorRef}
                    markdown={markdown}
                    plugins={[headingsPlugin(), quotePlugin(), listsPlugin(), thematicBreakPlugin(),
                        toolbarPlugin({
                            toolbarClassName: 'my-classname',
                            toolbarContents: () => (
                                    <>
                                        {' '}
                                        <UndoRedo />
                                        <BoldItalicUnderlineToggles />
                                        <BlockTypeSelect />
                                    </>
                            )
                        })]}
            />
            </>
    );
};

export default Editor;