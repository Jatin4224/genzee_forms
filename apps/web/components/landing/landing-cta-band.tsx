"use client";

import type { CSSProperties } from "react";
import { IconArrowRight, IconInnerShadowTop } from "@tabler/icons-react";
import { motion } from "motion/react";

import { FancyButton } from "~/components/landing/fancy-button";

export function LandingCtaBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 md:pb-28">
      <motion.div
        className="bg-aurora relative overflow-hidden rounded-4xl border border-border/60 px-6 py-16 text-center shadow-elevate-lg md:py-20"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        {/* faint wordmark marquee behind the copy */}
        <div
          aria-hidden
          className="animate-marquee pointer-events-none absolute inset-x-0 top-1/2 flex w-max -translate-y-1/2 gap-8 text-7xl font-black text-primary/[0.05] uppercase md:text-8xl"
          style={{ "--marquee-duration": "34s" } as CSSProperties}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap">
              Genzee Forms
            </span>
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-6">
          <IconInnerShadowTop className="size-9 text-primary" />
          <h2 className="font-heading text-4xl md:text-5xl">
            Ready to build your first form?
          </h2>
          <p className="max-w-md text-muted-foreground">
            It takes less than a minute to get started — no code, no credit card.
          </p>
          <FancyButton href="/login" variant="shine" size="lg">
            Get Started
            <IconArrowRight className="size-5" />
          </FancyButton>
        </div>
      </motion.div>
    </section>
  );
}
