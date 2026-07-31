"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconPlayerPlayFilled } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { FancyButton } from "~/components/landing/fancy-button";
import characterImg from "../../app/assets/character.png";

// Point this at a real published Genzee form to let visitors try one live.
// Set NEXT_PUBLIC_DEMO_FORM_ID in the web app's env; until then the link just
// scrolls down to the "how it works" section.
const demoFormId = process.env.NEXT_PUBLIC_DEMO_FORM_ID;
const demoHref = demoFormId ? `/form/${demoFormId}` : "#how-it-works";
const demoLabel = demoFormId ? "Try a live form" : "See how it works";

// playful rotating one-liners shown on the sticker chip
const quips = [
  "Google Forms are too boring",
  "Typeform is too expensive",
  "Spreadsheets aren't forms",
  "Make it actually fun",
];

function RotatingQuip() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % quips.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute -bottom-4 -left-3 z-20 rounded-2xl border border-border/70 bg-card px-3.5 py-2 text-xs font-semibold shadow-elevate-lg">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          initial={reduce ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -5 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex items-center gap-1.5 whitespace-nowrap"
        >
          <span className="text-primary">&ldquo;</span>
          {quips[i]}
          <span className="text-primary">&rdquo;</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function LandingHero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: "easeOut" as const },
        };

  return (
    <section className="relative overflow-hidden">
      {/* soft aurora wash, kept light so the section breathes */}
      <div aria-hidden className="bg-aurora pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
        {/* copy */}
        <div className="flex flex-col items-start gap-6">
          <motion.h1
            {...rise(0.02)}
            className="font-heading text-5xl leading-[1.03] text-foreground md:text-7xl"
          >
            Make forms with a{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">cool</span>
              <span
                aria-hidden
                className="absolute -inset-x-1.5 bottom-[0.1em] z-0 h-[0.36em] -rotate-1 rounded-sm bg-primary/25"
              />
            </span>{" "}
            vibe.
          </motion.h1>

          <motion.p {...rise(0.1)} className="max-w-md text-lg text-muted-foreground">
            Build it, publish it, share one link. Collect responses and watch the results roll
            in — all without writing a single line of code.
          </motion.p>

          <motion.div {...rise(0.16)} className="flex flex-wrap items-center gap-4 pt-1">
            <FancyButton href="/login" variant="shine" size="lg">
              Get Started
              <IconArrowRight className="size-5" />
            </FancyButton>
            <FancyButton href="/login" variant="sticker" size="lg">
              Log in
            </FancyButton>
          </motion.div>

          <motion.div {...rise(0.22)} className="flex flex-col gap-2">
            <Link
              href={demoHref}
              {...(demoFormId ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              <IconPlayerPlayFilled className="size-3.5 text-primary" />
              {demoLabel}
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-xs text-muted-foreground">
              Free to start · No credit card · Ready in 60 seconds
            </p>
          </motion.div>
        </div>

        {/* character poster */}
        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: -1 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        >
          {/* funky dotted patch */}
          <div
            aria-hidden
            className="bg-dot-grid absolute -top-3 -left-5 -z-10 size-24 rounded-2xl text-primary/30"
          />

          {/* tilted coral poster; the character multiplies onto it so its
           * baked-in backdrop reads as one warm duotone instead of grey. */}
          <div className="relative aspect-4/5 w-full -rotate-2 overflow-hidden rounded-[2.5rem] bg-gradient-brand shadow-elevate-lg">
            <Image
              src={characterImg}
              alt="Genzee Forms character"
              fill
              priority
              placeholder="blur"
              sizes="(max-width:768px) 90vw, 40vw"
              className="object-contain object-bottom mix-blend-multiply"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-white/15"
            />
          </div>

          <RotatingQuip />
        </motion.div>
      </div>
    </section>
  );
}
