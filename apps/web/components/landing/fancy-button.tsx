"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "~/lib/utils";

/*
 * Playful "shape" buttons for the landing page. Built entirely from CSS/SVG +
 * motion springs — no extra dependency. The animated shape (shine sweep, spinning
 * conic ring, sticker tilt) is purely decorative; the full rectangular area stays
 * clickable so hit targets and a11y are unaffected.
 */

const fancyButton = cva(
  "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // filled coral gradient with a diagonal light sweep
        shine:
          "bg-gradient-brand text-white shadow-elevate-lg [text-shadow:0_1px_1px_oklch(0.3_0.1_30/0.35)]",
        // white squircle sticker with a bold ring + soft drop shadow
        sticker:
          "border-2 border-foreground/12 bg-card text-foreground shadow-elevate-lg hover:border-primary/40",
        // solid core wrapped in a spinning conic gradient ring
        "gradient-border": "bg-background text-foreground",
      },
      size: {
        md: "h-11 rounded-2xl px-6 text-sm",
        lg: "h-14 rounded-[1.4rem] px-8 text-base",
      },
    },
    defaultVariants: { variant: "shine", size: "lg" },
  },
);

type FancyButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
} & VariantProps<typeof fancyButton>;

export function FancyButton({
  href,
  children,
  className,
  variant = "shine",
  size = "lg",
}: FancyButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="inline-block"
      // playful resting tilt on the sticker; springs upright on hover
      initial={variant === "sticker" && !reduce ? { rotate: -2.5 } : false}
      whileHover={reduce ? undefined : { scale: 1.04, rotate: 0, y: -2 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
    >
      <Link href={href} className={cn(fancyButton({ variant, size }), className)}>
        {/* shine: moving light band */}
        {variant === "shine" && !reduce && (
          <span
            aria-hidden
            className="animate-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-white/55 to-transparent"
          />
        )}

        {/* gradient-border: spinning conic ring behind a solid core */}
        {variant === "gradient-border" && (
          <>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 -z-10",
                !reduce && "animate-spin-slow",
              )}
              style={{
                background:
                  "conic-gradient(from 0deg, oklch(0.7 0.19 32), oklch(0.72 0.15 355), oklch(0.83 0.12 60), oklch(0.7 0.19 32))",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0.5 -z-10 rounded-[inherit] bg-background"
            />
          </>
        )}

        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </Link>
    </motion.div>
  );
}
