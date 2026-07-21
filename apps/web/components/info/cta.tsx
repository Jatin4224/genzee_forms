import { ArrowRightIcon, GithubIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { CommandLine } from "./code-block";
import { CTA, PRODUCT } from "./content";

export function Cta() {
  return (
    <section id="get" className="relative scroll-mt-20 overflow-hidden border-t border-border/60">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 left-1/2 h-96 w-4xl -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, var(--info-accent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-3xl px-5 py-24 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          {CTA.headline}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">
          {CTA.body}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href={PRODUCT.repoUrl}>
              {CTA.primary}
              <ArrowRightIcon />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={PRODUCT.repoUrl}>
              <GithubIcon />
              {CTA.secondary}
            </a>
          </Button>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <CommandLine command={PRODUCT.install} />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">{CTA.fineprint}</p>
      </div>

      <footer className="relative border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>{PRODUCT.name}</span>
          <span>Built with Next.js, tRPC, Drizzle and Turborepo.</span>
        </div>
      </footer>
    </section>
  );
}
