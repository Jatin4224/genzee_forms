import { ArrowRightIcon, CheckIcon, XIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { PRICING, PRODUCT } from "./content";
import { Section } from "./section";

export function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow={PRICING.eyebrow}
      centered
      title={PRICING.title}
      subtitle={PRICING.subtitle}
    >
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-(--info-accent)/30 bg-card shadow-sm">
          <div className="border-b border-border/60 bg-(--info-accent)/5 px-6 py-8 text-center sm:px-10">
            <div className="flex items-start justify-center gap-1">
              <span className="mt-2 text-2xl font-medium text-muted-foreground">
                {PRICING.currency}
              </span>
              <span className="text-6xl font-semibold tracking-tight tabular-nums">
                {PRICING.amount}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {PRICING.cadence} · lifetime access
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">{PRICING.compare}</p>

            <Button size="lg" className="mt-6 w-full sm:w-auto" asChild>
              <a href={PRODUCT.repoUrl}>
                {PRICING.cta}
                <ArrowRightIcon />
              </a>
            </Button>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <ul className="space-y-3">
              {PRICING.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-(--info-accent)" aria-hidden />
                  <span className="text-sm leading-relaxed text-pretty">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-border/60 pt-6">
              <h3 className="mb-3 text-sm font-medium">{PRICING.licenseTitle}</h3>
              <ul className="space-y-2">
                {PRICING.license.map((rule) => (
                  <li key={rule.text} className="flex gap-3">
                    {rule.allowed ? (
                      <CheckIcon
                        className="mt-0.5 size-4 shrink-0 text-(--info-accent)"
                        aria-hidden
                      />
                    ) : (
                      <XIcon
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground/60"
                        aria-hidden
                      />
                    )}
                    <span className="text-sm leading-relaxed text-pretty text-muted-foreground">
                      {rule.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
