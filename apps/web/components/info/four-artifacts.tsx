"use client";

import * as React from "react";
import { ArrowDownIcon, SparklesIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CodeBlock } from "./code-block";
import { ARTIFACTS, ARTIFACTS_CAPTION, SOURCE_PROCEDURE } from "./content";
import { Section } from "./section";

export function FourArtifacts() {
  const [active, setActive] = React.useState<string>("client");

  return (
    <Section
      id="artifacts"
      eyebrow="How it works"
      centered
      title="One procedure. Four artifacts."
      subtitle="This is the whole pitch. Write a procedure with Zod input and output schemas — then look at everything you did not have to write."
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* You write this */}
        <div className="lg:sticky lg:top-20">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
              You write this
            </span>
            <span className="text-xs text-muted-foreground">once</span>
          </div>
          <CodeBlock
            code={SOURCE_PROCEDURE}
            lang="ts"
            filename="packages/trpc/server/routes/auth/route.ts"
          />
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground lg:hidden">
            <ArrowDownIcon className="size-4" />
            <span className="text-xs">and you get all of this</span>
          </div>
        </div>

        {/* You get these */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-(--info-accent) px-2.5 py-0.5 text-xs font-medium text-(--info-accent-foreground)">
              <SparklesIcon className="size-3" />
              You get these
            </span>
            <span className="text-xs text-muted-foreground">free, and always in sync</span>
          </div>

          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="w-full">
              {ARTIFACTS.map((artifact) => (
                <TabsTrigger key={artifact.id} value={artifact.id} className="text-xs sm:text-sm">
                  {artifact.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {ARTIFACTS.map((artifact) => (
              <TabsContent key={artifact.id} value={artifact.id} className="mt-4 space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{artifact.blurb}</p>
                <CodeBlock code={artifact.code} lang={artifact.lang} filename={artifact.where} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-base text-pretty text-muted-foreground">
        {ARTIFACTS_CAPTION}
      </p>
    </Section>
  );
}
