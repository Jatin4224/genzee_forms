"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

type Stat = {
  value?: number;
  suffix?: string;
  prefix?: string;
  text?: string; // static label used when there's nothing to count up (e.g. ∞)
  label: string;
};

// honest, product-true highlights — no fabricated usage numbers
const stats: Stat[] = [
  { value: 20, suffix: "+", label: "Field types" },
  { value: 60, suffix: "s", label: "To publish" },
  { value: 100, suffix: "%", label: "No-code" },
  { text: "∞", label: "Responses" },
];

function CountUp({ value, prefix = "", suffix = "", text }: Stat) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (text != null || value == null || !inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, text, reduce, mv]);

  if (text != null) return <span ref={ref}>{text}</span>;

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(display)}
      {suffix}
    </span>
  );
}

export function StatsBand() {
  return (
    <section className="border-y border-border/50 bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex flex-col items-center gap-1 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <span className="font-heading text-4xl text-primary md:text-5xl">
              <CountUp {...stat} />
            </span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
