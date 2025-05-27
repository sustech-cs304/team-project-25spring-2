"use client";

import { Document as PDFDocument, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface PDFComponentProps {
    env_id: string;
    file_path: string;
}

export const PDFComponent: React.FC<PDFComponentProps> = ({ env_id, file_path }) => {
    const [numPages, setNumPages] = useState<number>();
    const [scale, setScale] = useState(1);
    const [pdfFile, setPdfFile] = useState<string | null>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getPDFFile().then((blob: Blob | null) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                setPdfFile(url);
                return () => URL.revokeObjectURL(url);
            }
        });
    }, [env_id, file_path]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const onPageLoadSuccess = (page: any) => {
        const containerWidth = pdfContainerRef.current?.clientWidth;
        const pdfWidth = page?.originalWidth;
        if (containerWidth && pdfWidth && scale === 1) // in initial load, set scale to fit the width
            setScale(containerWidth / pdfWidth);
    };

    const options = useMemo(() => ({
        cMapUrl: '/dist/cmaps/',
    }), []);

    const getPDFFile = () => {
        const url = process.env.NEXT_PUBLIC_API_URL + `/file/${env_id}/pdf`
        const formData = new FormData();
        formData.append('file_path', file_path);
        
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/pdf'
            },
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch PDF');
            }
            return response.blob();
        })
        .catch(error => {
            console.error('Error fetching PDF:', error);
            return null;
        });
    }

    return (
        <div ref={pdfContainerRef}
            className={`rounded-[var(--radius)] border-1 grow-0 h-full overflow-scroll`}
            style={{ "width": "100%" }}>
            {pdfFile && (
                <PDFDocument options={options} file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} onLoadSuccess={onPageLoadSuccess}>
                        </Page>
                    ))}
                </PDFDocument>
            )}
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