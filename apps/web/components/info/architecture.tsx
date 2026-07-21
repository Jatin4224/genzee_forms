import { ChevronRightIcon } from "lucide-react";

import { CodeBlock } from "./code-block";
import { DEPENDENCY_FLOWS, WORKSPACE_TREE } from "./content";
import { Section } from "./section";

export function Architecture() {
  return (
    <Section
      id="architecture"
      eyebrow="Architecture"
      centered
      title="Layers that stay in their lane."
      subtitle="Apps are thin. Packages hold the substance. Nothing reaches across a boundary it should not, which is why any single piece stays replaceable."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        <CodeBlock code={WORKSPACE_TREE} lang="bash" filename="workspace" />

        <div className="space-y-6">
          {DEPENDENCY_FLOWS.map((flow) => (
            <div key={flow.title} className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="mb-4 font-medium">{flow.title}</h3>
              <ol className="mb-4 flex flex-wrap items-center gap-y-2">
                {flow.chain.map((node, i) => (
                  <li key={node} className="flex items-center">
                    <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{node}</code>
                    {i < flow.chain.length - 1 ? (
                      <ChevronRightIcon
                        className="mx-1 size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="text-sm leading-relaxed text-muted-foreground">{flow.note}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
