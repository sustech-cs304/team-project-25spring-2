"use client";

import { Document as PDFDocument, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Play, Plus, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { usePDFContext, type BookmarkType } from "./PDFEnvProvider";
import { useUserContext } from "@/app/UserEnvProvider";
import { Input } from "@/components/ui/input";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const DeleteSnippetButton: React.FC<{
    onFeedbackAction: (feedback: any) => void,
    props: any,
    buttonClassName: string,
    snippet: any
}> = ({ onFeedbackAction, props, buttonClassName, snippet }) => {
    const { snippets, setSnippets } = usePDFContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = () => {
        const snippetToDelete = snippets.find((s: any) => s.id === snippet.id);
        setSnippets(snippets.filter((s: any) => s.id !== snippet.id));
        onFeedbackAction({
            snippets: snippets.filter((s: any) => s.id !== snippet.id),
            deleteSnippet: snippetToDelete
        });
        setIsDialogOpen(false);
    };

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className={buttonClassName}>
                        <Minus />
                    </Button>
                </DialogTrigger>
                <DialogContent className="z-[1000]">
                    <DialogTitle>Sure to delete?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this code snippet?
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

const BookmarkButton: React.FC<{
    onFeedbackAction: (feedback: any) => void,
    props: any,
    buttonClassName: string,
    pageNumber: number,
    position: { x: number; y: number }
}> = ({ onFeedbackAction, props, buttonClassName, pageNumber, position }) => {
    const { bookmarks, addBookmark, removeBookmark, materialId } = usePDFContext();
    const { userId } = useUserContext();
    const existingBookmark = bookmarks.find(b => b.material_id === materialId && b.user_id === userId);

    const handleAddBookmark = async () => {
        await addBookmark(pageNumber, userId);
    };

    const handleRemoveBookmark = async () => {
        await removeBookmark(pageNumber, userId);
    };

    return (
        <Button
            variant="outline"
            size="icon"
            className={buttonClassName}
            onClick={existingBookmark?.bookmark_list.includes(pageNumber) ? handleRemoveBookmark : handleAddBookmark}
        >
            {existingBookmark?.bookmark_list.includes(pageNumber) ? (
                <BookmarkCheck className="text-yellow-500" />
            ) : (
                <Bookmark />
            )}
        </Button>
    );
};

export const PDFPart: React.FC<PDFPartProps> = ({ props, onFeedbackAction }) => {
    const [numPages, setNumPages] = useState<number>();
    const [scale, setScale] = useState(1);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const { snippets, bookmarks, setPageNumber, materialId } = usePDFContext();
    const { userId } = useUserContext();
    const [localSnippets, setLocalSnippets] = useState<SnippetsData>([]);
    const { isTeacher } = useUserContext();

    useEffect(() => {
        setLocalSnippets(snippets);
    }, [snippets]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        onFeedbackAction({ ...props, numPages });
    }

    const onPageLoadSuccess = (page: any) => {
        const containerWidth = pdfContainerRef.current?.clientWidth;
        const pdfWidth = page?.originalWidth;
        setPageWidth(pdfWidth);
        setPageHeight(page?.originalHeight);
        if (containerWidth && pdfWidth && scale === 1) // in initial load, set scale to fit the width
            setScale(containerWidth / pdfWidth);
    };

    const options = useMemo(() => ({
        cMapUrl: '/dist/cmaps/',
    }), []);

    useEffect(() => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const pageHeight = (container.scrollHeight - 50) / numPages!;
            const currentPage = Math.floor(scrollTop / pageHeight) + 1;

            if (currentPage !== props.pageNumber) {
                onFeedbackAction({ ...props, pageNumber: currentPage });
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [numPages, props, onFeedbackAction]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const position = { x: x / scale, y: y / scale };
        onFeedbackAction({ clickPosition: position, pageNumber: pageNumber });
    };

    const handleBookmarkClick = (bookmark: number) => {
        if (pdfContainerRef.current) {
            const pageHeight = (pdfContainerRef.current.scrollHeight - 50) / numPages!;
            const targetScroll = (bookmark - 1) * pageHeight + 1;
            pdfContainerRef.current.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
            setPageNumber(bookmark);
        }
    };

    const getPDFFile = () => {
        if (!props.url) return undefined;
        if (typeof props.url === 'string' && !props.url.startsWith('data:application/pdf;base64,')) {
            return `data:application/pdf;base64,${props.url}`;
        }
        return props.url;
    };

    return (
        <div ref={pdfContainerRef}
            className={`rounded-[var(--radius)] border-1 grow-0 h-full overflow-scroll`}
            style={{ "width": props.width }}>
            <PDFDocument options={options} file={getPDFFile()}
                onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale}
                        onLoadSuccess={onPageLoadSuccess} onClick={(e) => handleClick(e, index + 1)}
                    >
                        <div className="react-pdf__Page__textContent textLayer" data-main-rotation="0"
                            style={{
                                width: `round(down, ${scale * pageWidth}px, var(--scale-round-x, 1px))`,
                                height: `round(down, ${scale * pageHeight}px, var(--scale-round-y, 1px))`,
                                pointerEvents: 'none',
                            }}>
                            {localSnippets.map((snippet, idx) => (
                                snippet.page === index + 1 &&
                                <div key={idx}
                                    style={{
                                        position: 'absolute',
                                        left: snippet.position.x * scale,
                                        top: snippet.position.y * scale,
                                        pointerEvents: 'auto',
                                    }}>
                                    <Button variant="outline" size="icon" className="size-6 ml-2 mb-2"
                                        onClick={() => onFeedbackAction({
                                            ...props,
                                            currentSnippet: snippet
                                        })}>
                                        <Play />
                                    </Button>
                                    <DeleteSnippetButton
                                        onFeedbackAction={onFeedbackAction}
                                        props={props}
                                        snippet={snippet}
                                        buttonClassName={`${isTeacher ? 'size-3 ml-2 mb-2 text-red-500 absolute top-0 right-0 transform translate-x-2 -translate-y-2' : 'hidden'}`}
                                    />
                                </div>
                            ))}
                            <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'auto' }}>
                                <BookmarkButton
                                    onFeedbackAction={onFeedbackAction}
                                    props={props}
                                    buttonClassName="size-6"
                                    pageNumber={index + 1}
                                    position={{ x: 10, y: 10 }}
                                />
                            </div>
                        </div>
                    </Page>
                ))}
            </PDFDocument>
            <div className="sticky bottom-0 left-0 z-[40] flex items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex">
                    <Button variant="outline" size="icon" className="size-6 ml-2 mb-2 mt-2"
                        onClick={() => setScale(scale + 0.1)}>
                        <Plus />
                    </Button>
                    <Button variant="outline" size="icon" className="size-6 ml-1.5 mb-2 mt-2"
                        onClick={() => setScale(scale - 0.1)}>
                        <Minus />
                    </Button>
                </div>
                <div className="ml-2 flex space-x-2 overflow-x-auto max-w-full mt-2 mb-2">
                    {bookmarks
                        .filter(bookmark => bookmark.material_id === materialId && bookmark.user_id === userId)
                        .map(bookmark => bookmark.bookmark_list)
                        .flat()
                        .sort((a, b) => a - b)
                        .map(bookmark => (
                            <Button
                                key={bookmark}
                                variant={props.pageNumber === bookmark ? "default" : "outline"}
                                size="sm"
                                className="text-xs whitespace-nowrap"
                                onClick={() => handleBookmarkClick(bookmark)}
                            >
                                Page {bookmark}
                            </Button>
                        ))}
                </div>
            </div>
        </div>
    );
};