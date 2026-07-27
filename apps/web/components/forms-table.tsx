"use client";

import Link from "next/link";

import { useListForms } from "~/hooks/api/form";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

//timestamps arrive as ISO strings over the wire, so normalise before formatting
function formatDate(value: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function FormsTable() {
  const { forms, isLoading } = useListForms();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        You don&apos;t have any forms yet. Create your first one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id} className="cursor-pointer">
              <TableCell className="font-medium">
                <Link href={`/dashboard/forms/${form.id}`} className="hover:underline">
                  {form.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {form.description || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(form.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
