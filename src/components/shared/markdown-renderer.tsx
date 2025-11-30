"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
    content: string;
    className?: string;
    maxHeight?: string;
}

export function MarkdownRenderer({ content, className, maxHeight }: MarkdownRendererProps) {
    return (
        <div 
            className={cn(
                "prose prose-neutral dark:prose-invert max-w-none",
                // Notion-like Typography
                "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
                "prose-h1:text-3xl prose-h1:mt-6 prose-h1:mb-4",
                "prose-h2:text-2xl prose-h2:mt-5 prose-h2:mb-3",
                "prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2",

                // Text Body
                "prose-p:text-[16px] prose-p:leading-7 prose-p:my-2 prose-p:text-foreground/90",

                // Lists
                "prose-ul:my-1 prose-ul:list-disc prose-ul:pl-6",
                "prose-ol:my-1 prose-ol:list-decimal prose-ol:pl-6",
                "prose-li:my-0.5 prose-li:text-foreground/90",

                // Blockquotes (Notion style: vertical bar, no italic usually, but we keep it subtle)
                "prose-blockquote:border-l-3 prose-blockquote:border-foreground prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-4 prose-blockquote:not-italic prose-blockquote:text-muted-foreground",

                // Inline Code (Notion style: red text on gray bg)
                "prose-code:text-[#EB5757] dark:prose-code:text-[#FF5F5F] prose-code:bg-[rgba(135,131,120,0.15)] dark:prose-code:bg-[rgba(255,255,255,0.1)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[85%] prose-code:font-mono prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",

                // Code Blocks
                "prose-pre:bg-muted prose-pre:text-muted-foreground prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4",

                maxHeight && "overflow-y-auto",
                className
            )}
            style={maxHeight ? { maxHeight } : undefined}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ node, ...props }) => (
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors cursor-pointer"
                            {...props}
                        />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-6 border rounded-lg">
                            <table className="min-w-full divide-y divide-border" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-muted/50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="px-4 py-3 text-sm text-foreground/90 border-t border-border" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                        <hr className="my-6 border-border" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
