import { CheckCircle2Icon } from "lucide-react";

import { CodeBlock } from "./code-block";
import { WORKFLOW_OUTRO, WORKFLOW_STEPS } from "./content";
import { Section } from "./section";

export function Workflow() {
  return (
    <Section
      eyebrow="The daily loop"
      centered
      title="Add an endpoint in about a minute."
      subtitle="Four steps, start to finish. This is the real auth route from the template, not a simplified illustration."
    >
      <div className="mx-auto max-w-3xl space-y-10">
        {WORKFLOW_STEPS.map((step, i) => (
          <div key={step.n} className="relative pl-12">
            {/* Connector line down to the next step. */}
            {i < WORKFLOW_STEPS.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-9 -bottom-10 left-3.75 w-px bg-border"
              />
            ) : null}
            <span className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border border-(--info-accent)/30 bg-(--info-accent)/10 font-mono text-sm font-medium text-(--info-accent)">
              {step.n}
            </span>

            <h3 className="mb-1 text-lg font-medium">{step.title}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{step.note}</p>
            <CodeBlock code={step.code} lang={step.lang} filename={step.file} />
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-2xl items-start gap-3 rounded-xl border border-(--info-accent)/30 bg-(--info-accent)/5 p-5">
        <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-(--info-accent)" />
        <p className="text-sm leading-relaxed text-pretty">{WORKFLOW_OUTRO}</p>
      </div>
    </Section>
  );
}
