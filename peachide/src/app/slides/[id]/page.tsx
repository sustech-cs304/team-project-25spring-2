'use client';

import {Avatar} from "@radix-ui/react-avatar";
import React, {Suspense, useEffect, useState} from "react";
import {AvatarFallback} from "@/components/ui/avatar";
import {MessageSquareQuote, Reply} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import {PDFPart} from "@/components/pdf/PDFPart";


const EditorComp = dynamic(() =>
        import('../../../components/editors/markdown-editor'), {ssr: false});


function ReplyBox({title, content, children = null}:
                          { title: string, content: string, children?: any | null }) {
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
                            <Button variant="ghost" size="icon" className="size-4 ml-2">
                                <Reply />
                            </Button>
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

function CommentsSection() {
    return (<div className="h-1/3 flex flex-col">
        <hr className="my-2" />
        <div className="font-bold text-lg w-full grid grid-cols-2">
            <div>Comments</div>
            <div className={"text-right"}>
                <Button variant="ghost" size="icon">
                    <MessageSquareQuote />
                </Button>
            </div>
        </div>
        <div className="overflow-scroll grow">
            <ReplyBox title="Title 1" content="Content 1">
                <ReplyBox title="Nested Title 1.1" content="Nested Content 1.1">
                    <ReplyBox title="Nested Title 1.1.1"
                            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium molestie felis, vitae elementum nulla cursus vel. Aliquam ut nunc molestie, tempor augue vehicula, dapibus dui. Mauris quis est ac arcu rhoncus suscipit. Morbi malesuada lacus magna, ut eleifend dolor luctus sit amet. Pellentesque faucibus, nibh non rhoncus tincidunt, dolor dui volutpat massa, ac accumsan mauris sapien ut nunc. Nam ut est quis sem blandit viverra. " />
                </ReplyBox>
                <ReplyBox title="Nested Title 1.2" content="Nested Content 1.2" />
            </ReplyBox>
            <ReplyBox title="Title 2" content="Content 2" />
        </div>
    </div>);
}

function PDFSection() {
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [numPages, setNumPages] = useState<number>(1);
    const [width, setWidth] = useState<number>(200);
    const containerRef = React.createRef<HTMLDivElement>();
    const handleFeedback = (feedback: any) => {
        if (feedback.pageNumber)
            setPageNumber(feedback.pageNumber);
        if (feedback.numPages)
            setNumPages(feedback.numPages);
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
        <PDFPart props={{url: '/example.pdf', pageNumber: pageNumber, width: width}}
                onFeedbackAction={handleFeedback} />
        <p className="pl-0.5 mt-2">
            Page {pageNumber} / {numPages}
        </p>
    </div>);
}

export default function Slides() {
    return (
            <div className="p-5 rounded-[var(--radius)] border-1 h-full">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={70} className="col-span-2 h-full flex flex-col pr-5">
                        <PDFSection />
                        <CommentsSection />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={30} className="pl-5 h-full">
                        <Tabs defaultValue="notes" className="w-full h-full">
                            <TabsList>
                                <TabsTrigger value="snippets">Code Snippets</TabsTrigger>
                                <TabsTrigger value="notes">Notes</TabsTrigger>
                            </TabsList>
                            <TabsContent value="snippets" className="h-full">
                                Code snippets here.
                            </TabsContent>
                            <TabsContent value="notes" className="h-full">
                                <Suspense fallback={null}>
                                    <EditorComp heightMode="auto" markdown={`
                                        Hello **world**!
                                    `} />
                                </Suspense>
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

    );
}
