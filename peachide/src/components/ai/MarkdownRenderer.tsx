"use client";

import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import mermaid from "mermaid";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";

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

function CodeBlock({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLPreElement>(null);

    // Utility to extract code string from children
    function getCodeString(children: React.ReactNode): string {
        if (typeof children === 'string') return children;
        if (Array.isArray(children)) return children.map(getCodeString).join('');
        if (typeof children === 'object' && children && 'props' in children) {
            // @ts-ignore
            return getCodeString(children.props.children);
        }
        return '';
    }

    const codeString = getCodeString(children).trim();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (err) {
            if (codeRef.current) {
                const range = document.createRange();
                range.selectNodeContents(codeRef.current);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
                document.execCommand('copy');
                sel?.removeAllRanges();
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            }
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className={copied ? "!bg-green-500 h-5 w-14" : "h-5 w-10"}
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 4,
                }}
                aria-label="Copy code"
            >
                {copied ? 'Copied!' : 'Copy'}
            </Button>
            <pre ref={codeRef} style={{ marginTop: 0 }}>
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    );
}

export default function MarkdownRenderer({ children }: Props) {
    return (
        <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex, rehypeStringify]}
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).trim();
                    // Mermaid block
                    if (match && match[1] === "mermaid") {
                        return <Mermaid code={codeString} />;
                    }
                    // Code block (not inline)
                    if (className) {
                        // Add copy button for code blocks
                        return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
                    }
                    // Inline code
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