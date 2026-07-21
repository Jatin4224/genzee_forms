import {
  ContainerIcon,
  DatabaseIcon,
  FileJsonIcon,
  GaugeIcon,
  KeyRoundIcon,
  LayersIcon,
  PaletteIcon,
  RouteIcon,
  ScrollTextIcon,
  SendIcon,
  ShieldCheckIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";
import { FEATURES } from "./content";
import { Section } from "./section";

const ICONS: Record<string, LucideIcon> = {
  FileJson: FileJsonIcon,
  Send: SendIcon,
  ShieldCheck: ShieldCheckIcon,
  Route: RouteIcon,
  KeyRound: KeyRoundIcon,
  Layers: LayersIcon,
  Database: DatabaseIcon,
  ScrollText: ScrollTextIcon,
  Gauge: GaugeIcon,
  Palette: PaletteIcon,
  Container: ContainerIcon,
  Wrench: WrenchIcon,
};

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="What you get"
      centered
      title="Every decision already made, correctly."
      subtitle="Not a pile of dependencies. A set of choices that fit together, each one there because it removes work you would otherwise do by hand."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = ICONS[feature.icon] ?? FileJsonIcon;
          return (
            <Card
              key={feature.title}
              className="border-border/60 transition-colors hover:border-(--info-accent)/40"
            >
              <CardContent className="space-y-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-(--info-accent)/10 text-(--info-accent)">
                  <Icon className="size-4.5" />
                </div>
                <h3 className="leading-snug font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
