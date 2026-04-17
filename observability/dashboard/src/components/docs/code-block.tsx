"use client";

import * as React from "react";
import { highlight } from "sugar-high";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: string;
  lang?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({ children, lang, title, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  // sugar-high returns HTML with colored spans
  const highlighted = highlight(children);

  return (
    <div className={`group relative my-5 overflow-hidden rounded-xl border border-border/60 shadow-sm ${className ?? ""}`}>
      {(title || lang) && (
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">
            {title || lang}
          </span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <><Check className="size-3" /> Copied</>
            ) : (
              <><Copy className="size-3" /> Copy</>
            )}
          </button>
        </div>
      )}
      {!title && !lang && (
        <button
          onClick={copy}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-[#2a2a2e] px-2.5 py-1 text-xs text-[#a1a1aa] opacity-0 transition-all hover:bg-[#3a3a3e] hover:text-[#e4e4e7] group-hover:opacity-100"
        >
          {copied ? (
            <><Check className="size-3" /> Copied</>
          ) : (
            <><Copy className="size-3" /> Copy</>
          )}
        </button>
      )}
      <div
        className="sh-root overflow-x-auto scrollbar-thin"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <pre
          className="sh-root"
          style={{
            padding: "18px 20px",
            margin: 0,
            fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: "13px",
            lineHeight: "1.7",
            backgroundColor: "transparent",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <code
            dangerouslySetInnerHTML={{ __html: highlighted }}
            style={{ backgroundColor: "transparent", padding: 0, font: "inherit" }}
          />
        </pre>
      </div>
      <style>{`
        .sh-root { color: #e4e4e7; }
        .sh-root .sh-keyword { color: #c792ea; }
        .sh-root .sh-string { color: #a5d6a7; }
        .sh-root .sh-number { color: #f78c6c; }
        .sh-root .sh-comment { color: #637777; font-style: italic; }
        .sh-root .sh-property { color: #82aaff; }
        .sh-root .sh-entity { color: #89ddff; }
        .sh-root .sh-jsxliterals { color: #f07178; }
        .sh-root .sh-sign { color: #89ddff; }
        .sh-root .sh-class { color: #ffcb6b; }
        .sh-root .sh-identifier { color: #e4e4e7; }
        .sh-root .sh-multi { color: #82aaff; }
      `}</style>
    </div>
  );
}
