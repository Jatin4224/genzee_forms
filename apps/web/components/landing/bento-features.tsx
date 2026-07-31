"use client";

import type { ReactNode } from "react";
import {
  IconForms,
  IconLink,
  IconMoon,
  IconShieldCheck,
  IconSparkles,
  type Icon,
} from "@tabler/icons-react";
import { motion } from "motion/react";

import { cn } from "~/lib/utils";

function BentoCard({
  icon: IconCmp,
  title,
  description,
  className,
  children,
  index,
}: {
  icon: Icon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
  index: number;
}) {
  return (
    <motion.div
      className={cn(
        "group flex flex-col gap-3 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-elevate backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-elevate-lg",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
    >
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-transform duration-300 group-hover:scale-110">
        <IconCmp className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading text-xl">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

export function BentoFeatures() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
      <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          Everything included
        </span>
        <h2 className="font-heading text-4xl md:text-5xl">A builder that does it all</h2>
        <p className="text-muted-foreground">
          From a blank canvas to real, analysed responses — in one warm little app.
        </p>
      </div>

      <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-5 md:grid-cols-6">
        {/* featured: drag-and-drop builder */}
        <BentoCard
          index={0}
          icon={IconForms}
          title="Drag-and-drop builder"
          description="Compose forms from 20+ field types. Reorder with a drag, tweak in a click."
          className="md:col-span-3 md:row-span-2"
        >
          <div className="mt-auto space-y-2 pt-4">
            {["Short answer", "Multiple choice", "Rating"].map((label, i) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm transition-transform group-hover:translate-x-0",
                  i === 1 && "border-primary/40 ring-2 ring-primary/15",
                )}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="h-0.5 w-3 rounded bg-muted-foreground/40" />
                  <span className="h-0.5 w-3 rounded bg-muted-foreground/40" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </BentoCard>

        {/* share link */}
        <BentoCard
          index={1}
          icon={IconLink}
          title="Share one link"
          description="Publish instantly and share a public link. No respondent account required."
          className="md:col-span-3"
        >
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-brand px-3 py-2 text-sm text-white">
            <IconLink className="size-4 shrink-0" />
            <span className="truncate">genzee.app/f/abc</span>
            <span className="ml-auto shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold">
              Copy
            </span>
          </div>
        </BentoCard>

        {/* live responses chart */}
        <BentoCard
          index={2}
          icon={IconSparkles}
          title="Live responses"
          description="Every answer in a clean table, summarised on a live dashboard."
          className="md:col-span-3"
        >
          <div className="mt-2 flex h-14 items-end gap-1.5">
            {[40, 65, 50, 80, 60, 92, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-primary/25 group-hover:bg-primary/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </BentoCard>

        {/* smaller trio */}
        <BentoCard
          index={3}
          icon={IconShieldCheck}
          title="Smart validation"
          description="Required fields, email checks, and limits keep answers clean."
          className="md:col-span-2"
        />
        <BentoCard
          index={4}
          icon={IconMoon}
          title="Light & dark"
          description="A warm, themeable UI that looks right in any mode."
          className="md:col-span-2"
        />
        <BentoCard
          index={5}
          icon={IconSparkles}
          title="20+ field types"
          description="Text, choice, rating, date, and more — mix and match freely."
          className="md:col-span-2"
        />
      </div>
    </section>
  );
}
