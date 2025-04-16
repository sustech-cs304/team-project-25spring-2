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
    const {theme, setTheme} = useTheme();
    return (
            <MDXEditor
                    className={`${theme}-theme ${theme}-editor ${heightMode === "auto" ? "" : "h-full"}`}
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
    );
};

export default Editor;