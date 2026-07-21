import { CommandLine } from "./code-block";
import { PORTS, QUICKSTART_STEPS } from "./content";
import { Section } from "./section";

export function Quickstart() {
  return (
    <Section
      id="quickstart"
      eyebrow="Quickstart"
      centered
      title="Five commands to a running stack."
      subtitle="Database, API, docs, playground and web app — all up, all talking to each other."
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <ol className="space-y-4">
          {QUICKSTART_STEPS.map((step, i) => (
            <li key={step.command} className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              <CommandLine command={step.command} />
            </li>
          ))}
        </ol>

        <div>
          <h3 className="mb-4 text-sm font-medium">Then everything is here</h3>
          <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
            {PORTS.map((port) => (
              <li
                key={port.url}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <span className="text-sm font-medium">{port.what}</span>
                <code className="font-mono text-xs text-muted-foreground">{port.url}</code>
                <span className="w-full text-xs text-muted-foreground/70">{port.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Open the playground and send a signup request. That round trip — validated input, a row
            in Postgres, a typed response — is the whole template working end to end.
          </p>
        </div>
      </div>
    </Section>
  );
}
