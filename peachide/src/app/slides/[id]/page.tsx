'use client';

import {Avatar} from "@radix-ui/react-avatar";
import React, {Suspense, useEffect, useState} from "react";
import {AvatarFallback} from "@/components/ui/avatar";
import {MessageSquareQuote, Play, Reply, Save} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import {PDFPart} from "@/components/pdf/PDFPart";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {PDFProvider, usePDFContext} from "@/components/pdf/PDFEnvProvider";
import {Textarea} from "@/components/ui/textarea";
import MonacoEditorComponent from "@/components/coding/MonacoEditor";
import {motion} from "framer-motion";
import {random} from "lodash";

const EditorComp = dynamic(() =>
        import('../../../components/editors/markdown-editor'), {ssr: false});


function ReplyBox({id, title, content, children = null}:
                          { id: string, title: string, content: string, children?: any | null }) {
    const {pageNumber} = usePDFContext();
    return (
            <div className="flex flex-col m-2">
                <div className="flex flex-row">
                    <Avatar className="w-[40px] h-[40px] grow-0">
                        <AvatarFallback className="w-[40px]">U</AvatarFallback>
                    </Avatar>
                    <div className="grow pl-3">
                        <div>{title}</div>
                        <div className="text-sm opacity-75">
                            {content}
                        </div>
                        <div className="flex justify-content-center">
                            <span className="text-xs opacity-50"
                                    suppressHydrationWarning>{new Date().toLocaleString()}</span>
                            <ReplyDialog trigger={
                                <Button variant="ghost" size="icon" className="size-4 ml-2">
                                    <Reply />
                                </Button>} props={{page: pageNumber, type: "reply", id: id}} />
                        </div>
                    </div>
                </div>
                {
                    children != null ? <div className="ml-8">
                        {children}
                    </div> : ''
                }
            </div>
    );
}

type ReplyProps = {
    page: number,
    type: 'comment' | 'reply',
    id?: string,
}

function ReplyDialog({trigger, props}: { trigger: React.ReactNode, props: ReplyProps }) {
    return (<Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add {props.type === 'reply' ? 'Reply' : 'Comment'}</DialogTitle>
            </DialogHeader>
            <Textarea placeholder="Type your message here." />
            <DialogFooter>
                <Button type="submit">Submit</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
}

function CommentsSection() {
    const {pageNumber} = usePDFContext();

    return (<div className="h-1/3 flex flex-col">
        <hr className="my-2" />
        <div className="font-bold text-lg w-full grid grid-cols-2">
            <div>Comments</div>
            <div className={"text-right"}>
                <ReplyDialog trigger={
                    <Button variant="ghost" size="icon">
                        <MessageSquareQuote />
                    </Button>
                } props={{page: pageNumber, type: "comment"}} />
            </div>
        </div>
        <div className="overflow-scroll grow">
            <ReplyBox id="1" title="Title 1" content="Content 1">
                <ReplyBox id="2" title="Nested Title 1.1" content="Nested Content 1.1">
                    <ReplyBox id="3" title="Nested Title 1.1.1"
                            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium molestie felis, vitae elementum nulla cursus vel. Aliquam ut nunc molestie, tempor augue vehicula, dapibus dui. Mauris quis est ac arcu rhoncus suscipit. Morbi malesuada lacus magna, ut eleifend dolor luctus sit amet. Pellentesque faucibus, nibh non rhoncus tincidunt, dolor dui volutpat massa, ac accumsan mauris sapien ut nunc. Nam ut est quis sem blandit viverra. " />
                </ReplyBox>
                <ReplyBox id="4" title="Nested Title 1.2" content="Nested Content 1.2" />
            </ReplyBox>
            <ReplyBox id="5" title="Title 2" content="Content 2" />
        </div>
    </div>);
}

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
            console.log(feedback.snippets, "SNPP", feedback);
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

export default function Slides() {
    const [url, setUrl] = useState<string>('/example.pdf');
    const [mdNote, setMdNote] = useState<string>(`Hello **world**!`);
    return (
            <PDFProvider>
                <motion.div className="p-5 rounded-[var(--radius)] border-1 h-full"
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}>
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={70} className="col-span-2 h-full flex flex-col pr-5">
                            <PDFSection url={url} />
                            <CommentsSection />
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
