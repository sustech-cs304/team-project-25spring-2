'use client';

import React, {Suspense, use, useEffect, useState} from "react";
import {Play, Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import {PDFPart} from "@/components/pdf/PDFPart";
import {PDFProvider, usePDFContext} from "@/components/pdf/PDFEnvProvider";
import MonacoEditorComponent from "@/components/coding/MonacoEditor";
import {motion} from "framer-motion";
import {random} from "lodash";
import {useMaterial} from "@/app/slides/[id]/swr";
import {CommentsSection} from "@/app/slides/[id]/Comments";

const EditorComp = dynamic(() =>
        import('../../../components/editors/markdown-editor'), {ssr: false});

function PDFSection({url}: { url: string }) {
    const {
        pageNumber,
        setPageNumber,
        numPages,
        setNumPages,
        setCurrentSnippet,
        snippets,
        setSnippets
    } = usePDFContext();
    const [width, setWidth] = useState<number>(200);
    const containerRef = React.createRef<HTMLDivElement>();
    const [isAddingSnippet, setIsAddingSnippet] = useState<boolean>(false);
    const handleFeedback = (feedback: any) => {
        if (feedback.pageNumber) {
            setPageNumber(feedback.pageNumber);
            if (feedback.numPages)
                setNumPages(feedback.numPages);
        }
        if (feedback.snippets) {
            setSnippets(feedback.snippets);
        }
        if (feedback.currentSnippet) {
            setCurrentSnippet(feedback.currentSnippet);
        }
        if (feedback.clickPosition) {
            if (isAddingSnippet) {
                console.log(feedback);
                setSnippets([...snippets, {
                    text: 'console.log(\'Hello\')',
                    position: feedback.clickPosition,
                    page: feedback.pageNumber,
                    id: String(random(1000, 9999)),
                    lang: 'javascript'
                }]);
                setIsAddingSnippet(false);
            }
        }
    };
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const newWidth = entry.contentRect.width;
                setWidth(newWidth);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => {
            resizeObserver.disconnect();
        };
    }, []);
    return (<div className="h-2/3 flex flex-col" ref={containerRef}>
        <PDFPart props={{url: url, pageNumber: pageNumber, width: width, snippets: snippets}}
                onFeedbackAction={handleFeedback} />
        <div className="pl-0.5 mt-2 grid grid-cols-3">
            <div className="col-span-2">
                Page {pageNumber} / {numPages}
            </div>
            <div className="text-right">
                <Button className="h-6 text-xs" onClick={() => setIsAddingSnippet(!isAddingSnippet)}>
                    Add Snippet
                </Button>
            </div>
        </div>
    </div>);
}

function CodeSnippetEditor() {
    const {currentSnippet} = usePDFContext();
    const [title, setTitle] = useState<string>('');
    const [editor, setEditor] = useState<any>(null);

    useEffect(() => {
        if (currentSnippet.page === 0 || currentSnippet.id === '') {
            setTitle('Please select a snippet to edit');
            return;
        } else {
            setTitle(`Snippet ${currentSnippet.id} on page ${currentSnippet.page}`);
        }
        setEditor(<MonacoEditorComponent initialData={currentSnippet.text}
                language={currentSnippet.lang} />);
    }, [currentSnippet]);

    return (
            <div className={"h-full flex flex-col w-full"}>
                <div className="text-sm mb-3 grid grid-cols-4 w-full">
                    <div className="col-span-3">{title}</div>
                    <div className={"text-right"}>
                        <Button variant="ghost" size="icon" className="ml-2 size-4" disabled={editor == null}>
                            <Save />
                        </Button>
                        <Button variant="ghost" size="icon" className="ml-2 size-4" disabled={editor == null}>
                            <Play />
                        </Button>
                    </div>
                </div>
                {editor}
            </div>
    );
}


export default function Slides({params}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = use(params);
    const {material} = useMaterial(resolvedParams.id);

    const [mdNote, setMdNote] = useState<string>(`Hello **world**!`);

    return (
            <PDFProvider>
                <motion.div className="p-5 rounded-[var(--radius)] border-1 h-full"
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}>
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={70} className="col-span-2 h-full flex flex-col pr-5">
                            <PDFSection url={material?.data} />
                            <CommentsSection id={resolvedParams.id} />
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={30} className="pl-5 h-full">
                            <Tabs defaultValue="snippets" className="w-full h-full">
                                <TabsList>
                                    <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                </TabsList>
                                <TabsContent value="snippets" className="h-full">
                                    <CodeSnippetEditor />
                                </TabsContent>
                                <TabsContent value="notes" className="h-full">
                                    <Suspense fallback={null}>
                                        <EditorComp heightMode="auto" markdown={mdNote} />
                                    </Suspense>
                                </TabsContent>
                            </Tabs>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </motion.div>
            </PDFProvider>
    );
}
