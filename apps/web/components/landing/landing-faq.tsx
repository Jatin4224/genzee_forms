"use client";

import { motion } from "motion/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const faqs = [
  {
    q: "Is Genzee Forms free to start?",
    a: "Yes. Create your account and build your first form in under a minute — no credit card needed.",
  },
  {
    q: "Do people need an account to respond?",
    a: "No. Publish your form and share the public link — anyone can fill it out without signing up.",
  },
  {
    q: "What kinds of fields can I add?",
    a: "Short and long text, multiple choice, ratings, dates, and more — with validation like required fields and email checks.",
  },
  {
    q: "Where do responses go?",
    a: "Every submission lands in a clean table on your dashboard, summarised with live totals and trends.",
  },
  {
    q: "Does it work on mobile?",
    a: "Absolutely. Both the builder and the forms your respondents see are fully responsive.",
  },
];

export function LandingFaq() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-20 md:py-28">
      <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold tracking-widest text-primary uppercase">
          FAQ
        </span>
        <h2 className="font-heading text-4xl md:text-5xl">Questions, answered</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45 }}
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left font-heading text-lg">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
