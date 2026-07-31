"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";

import { cn } from "~/lib/utils";

// Kept honest: we contrast Genzee against a generic "typical form tool" rather
// than asserting specific (and easily-wrong) facts about named competitors.
const rows: { label: string; genzee: boolean; others: boolean }[] = [
  { label: "Forms that actually look good", genzee: true, others: false },
  { label: "Publish in about 60 seconds", genzee: true, others: false },
  { label: "No code, ever", genzee: true, others: true },
  { label: "Respondents need no account", genzee: true, others: true },
  { label: "Warm, playful design out of the box", genzee: true, others: false },
];

function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-primary/12 text-primary">
      <IconCheck className="size-4" />
    </span>
  ) : (
    <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
      <IconX className="size-4" />
    </span>
  );
}

export function Comparison() {
  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-20 md:py-28">
      <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Why Genzee
        </span>
        <h2 className="font-heading text-4xl md:text-5xl">Not your average form tool</h2>
      </div>

      <motion.div
        className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-elevate-lg backdrop-blur"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        {/* header row */}
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-border/60 bg-secondary/40 px-5 py-4 text-sm font-semibold sm:gap-6 sm:px-8">
          <span className="text-muted-foreground">What you get</span>
          <span className="w-20 text-center font-heading text-base text-primary sm:w-28">
            Genzee
          </span>
          <span className="w-20 text-center text-xs text-muted-foreground sm:w-28 sm:text-sm">
            Typical tools
          </span>
        </div>

        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-border/50 px-5 py-4 last:border-0 sm:gap-6 sm:px-8"
          >
            <span className="text-sm sm:text-base">{row.label}</span>
            <span className={cn("w-20 sm:w-28")}>
              <Mark ok={row.genzee} />
            </span>
            <span className="w-20 sm:w-28">
              <Mark ok={row.others} />
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
