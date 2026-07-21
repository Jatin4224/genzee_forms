import * as React from "react";

import { cn } from "~/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Center the heading block. Defaults to left-aligned. */
  centered?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  centered = false,
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-20 border-t border-border/60 py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
          {eyebrow ? (
            <p className="mb-3 font-mono text-xs tracking-[0.2em] text-(--info-accent) uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
