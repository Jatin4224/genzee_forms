"use client";

import { IconChartBar, IconLink, IconWand } from "@tabler/icons-react";
import { motion } from "motion/react";

const steps = [
  {
    icon: IconWand,
    title: "Build",
    description: "Add fields, pick types, set validation. Drag to reorder — no code required.",
  },
  {
    icon: IconLink,
    title: "Share",
    description: "Publish and copy one public link. Anyone can respond — no account needed.",
  },
  {
    icon: IconChartBar,
    title: "Collect",
    description: "Watch responses land in a clean table with a live dashboard of the results.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 md:py-28">
      <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          How it works
        </span>
        <h2 className="font-heading text-4xl md:text-5xl">Three steps to your first form</h2>
      </div>

      <div className="relative grid gap-10 md:grid-cols-3">
        {/* dashed connector behind the steps */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dashed border-primary/30 md:block"
        />

        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="relative flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.12 }}
          >
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-elevate-lg">
              <step.icon className="size-7" />
              <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border-2 border-background bg-card text-xs font-bold text-primary">
                {i + 1}
              </span>
            </div>
            <h3 className="font-heading text-2xl">{step.title}</h3>
            <p className="max-w-xs text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
