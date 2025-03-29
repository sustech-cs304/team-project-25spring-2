"use client";

import {Document as PDFDocument, Page, pdfjs} from "react-pdf";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import React, {useEffect, useMemo, useRef, useState} from "react";
import {Minus, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
).toString();

interface PDFPartProps {
    props: {
        url: string;
        pageNumber: number;
        numPages?: number;
        width?: number;
    },
    onFeedbackAction: (feedback: any) => void;
}

export const PDFPart: React.FC<PDFPartProps> = ({props, onFeedbackAction}) => {
    const [numPages, setNumPages] = useState<number>();
    const [scale, setScale] = useState(1);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({numPages}: { numPages: number }): void {
        setNumPages(numPages);
        onFeedbackAction({...props, numPages});
    }

    const onPageLoadSuccess = (page: any) => {
        const pdfWidth = page?.originalWidth;
        if (props.width && pdfWidth && scale === 1) // in initial load, set scale to fit the width
            setScale(props.width / pdfWidth);
    };

    const options = useMemo(() => ({
        cMapUrl: '/dist/cmaps/',
    }), []);

    useEffect(() => {
        const container = pdfContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const pageHeight = container.scrollHeight / numPages!;
            const currentPage = Math.floor(scrollTop / pageHeight) + 1;

            if (currentPage !== props.pageNumber) {
                onFeedbackAction({...props, pageNumber: currentPage});
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [numPages, props, onFeedbackAction]);

    return (
            <div ref={pdfContainerRef}
                    className={`rounded-[var(--radius)] border-1 grow-0 h-full overflow-scroll`}
                    style={{"width": props.width}}>
                <PDFDocument options={options} file={props.url}
                        onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (el, index) => (
                            <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale}
                                    onLoadSuccess={onPageLoadSuccess}
                            />
                    ))}
                </PDFDocument>
                <div className="sticky bottom-0 left-0 z-[1000]">
                    <Button variant="outline" size="icon" className="size-6 ml-2 mb-2"
                            onClick={() => setScale(scale + 0.1)}>
                        <Plus />
                    </Button>
                    <Button variant="outline" size="icon" className="size-6 ml-1.5 mb-2"
                            onClick={() => setScale(scale - 0.1)}>
                        <Minus />
                    </Button>
                </div>
            </div>

    );
};