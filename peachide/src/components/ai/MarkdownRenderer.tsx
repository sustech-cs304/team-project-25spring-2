"use client";

import React, { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import mermaid from "mermaid";
import { v4 as uuidv4 } from 'uuid';

type Props = {
    children: string;
};

function Mermaid({ code }: { code: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        // Only initialize once
        if (!('initialized' in mermaid)) {
            mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true });
            (mermaid as any).initialized = true;
        }
        // Render asynchronously
        mermaid.render("mermaid-svg-" + uuidv4(), code)
            .then(({ svg }) => {
                if (!cancelled && ref.current) {
                    ref.current.innerHTML = svg;
                }
            })
            .catch((err) => {
                if (!cancelled && ref.current) {
                    ref.current.innerHTML = `Error rendering mermaid diagram`;
                }
            });
        return () => {
            cancelled = true;
        };
    }, [code]);

    return <div ref={ref} />;
}

export default function MarkdownRenderer({ children }: Props) {
    return (
        <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex, rehypeStringify]}
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    if (match && match[1] === "mermaid") {
                        return <Mermaid code={String(children).trim()} />;
                    }
                    return (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {children}
        </Markdown>
    );
}