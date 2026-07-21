import { CheckIcon, MinusIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { COMPARISON, PRODUCT } from "./content";
import { Section } from "./section";

export function Comparison() {
  return (
    <Section
      eyebrow="The difference"
      centered
      title="What you would have built anyway."
      subtitle="Nothing here is impossible to assemble yourself. The question is whether you want to spend the first week of the project doing it."
    >
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[22%] min-w-36">Concern</TableHead>
              <TableHead className="min-w-56">Starting from scratch</TableHead>
              <TableHead className="min-w-56 text-(--info-accent)">{PRODUCT.name}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMPARISON.rows.map((row) => (
              <TableRow key={row.concern}>
                <TableCell className="align-top font-medium">{row.concern}</TableCell>
                <TableCell className="align-top text-muted-foreground">
                  <span className="flex gap-2">
                    <MinusIcon className="mt-0.5 size-4 shrink-0 opacity-50" aria-hidden />
                    <span className="text-pretty">{row.diy}</span>
                  </span>
                </TableCell>
                <TableCell className="align-top">
                  <span className="flex gap-2">
                    <CheckIcon
                      className="mt-0.5 size-4 shrink-0 text-(--info-accent)"
                      aria-hidden
                    />
                    <span className="text-pretty">{row.ours}</span>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}
