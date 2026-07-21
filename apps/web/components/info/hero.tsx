import { ArrowRightIcon, BookOpenIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CommandLine } from "./code-block";
import { PRODUCT, STACK_BADGES } from "./content";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient accent glow — purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-128 w-5xl -translate-x-1/2 rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--info-accent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-20 pb-16 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 font-mono text-xs">
            <span className="size-1.5 rounded-full bg-(--info-accent)" />
            TypeScript monorepo template
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {PRODUCT.tagline}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
            {PRODUCT.subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <a href="#get">
                Get the template
                <ArrowRightIcon />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#artifacts">
                <BookOpenIcon />
                See how it works
              </a>
            </Button>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <CommandLine command={PRODUCT.install} />
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {STACK_BADGES.map((badge) => (
              <li key={badge} className="font-mono text-xs text-muted-foreground">
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
