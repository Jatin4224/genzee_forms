"use client";

import * as React from "react";

import { cn } from "~/lib/utils";
import { CopyButton } from "./copy-button";
import { tokenize, TOKEN_CLASS, type Lang } from "./highlight";

interface CodeBlockProps {
  code: string;
  lang?: Lang;
  /** Shown in the title bar — usually a file path or a URL. */
  filename?: string;
  /** Small right-aligned tag in the title bar, e.g. an HTTP method. */
  tag?: string;
  className?: string;
}

/**
 * Code samples stay dark in both themes, the way an editor or terminal does.
 * That keeps one token palette instead of two, and reads as "this is code".
 */
export function CodeBlock({ code, lang = "ts", filename, tag, className }: CodeBlockProps) {
  const tokens = React.useMemo(() => tokenize(code, lang), [code, lang]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
        </div>
        {filename ? (
          <span className="truncate font-mono text-xs text-zinc-400">{filename}</span>
        ) : null}
        <div className="ml-auto flex items-center gap-1">
          {tag ? (
            <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-zinc-400 uppercase">
              {tag}
            </span>
          ) : null}
          <CopyButton value={code} label="Code copied" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <pre className="p-4 font-mono text-[13px] leading-relaxed">
          <code>
            {tokens.map((token, i) => (
              <span key={i} className={TOKEN_CLASS[token.kind]}>
                {token.text}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

/** A single copyable shell command, styled as an inline terminal line. */
export function CommandLine({ command, className }: { command: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-950 py-2 pr-2 pl-4",
        className,
      )}
    >
      <span className="font-mono text-sm text-emerald-400 select-none">$</span>
      <code className="flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap text-zinc-200">
        {command}
      </code>
      <CopyButton value={command} label="Command copied" />
    </div>
  );
}
