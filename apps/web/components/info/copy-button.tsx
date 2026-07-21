"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "~/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copied to clipboard", className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(label);
    } catch {
      toast.error("Could not access the clipboard");
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy to clipboard"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
        "text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100",
        "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none",
        className,
      )}
    >
      {copied ? <CheckIcon className="size-4 text-emerald-400" /> : <CopyIcon className="size-4" />}
    </button>
  );
}
