"use client";

import Link from "next/link";
import { IconClipboardText, IconPencil, IconTrash } from "@tabler/icons-react";

import { fireConfetti } from "~/lib/confetti";
import { useDeleteForm, useListForms, useUpdateForm } from "~/hooks/api/form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { CreateFormDialog } from "~/components/create-form-dialog";
import { EmptyState } from "~/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { EditFormDialog } from "~/components/edit-form-dialog";

//timestamps arrive as ISO strings over the wire, so normalise before formatting
function formatDate(value: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function FormsTable() {
  const { forms, isLoading } = useListForms();
  const { updateFormAsync } = useUpdateForm();
  const { deleteFormAsync } = useDeleteForm();

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border">
        <div className="border-b bg-muted/40 px-4 py-3">
          <Skeleton className="h-3.5 w-28" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b px-4 py-4 last:border-0"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <EmptyState
        icon={<IconClipboardText />}
        title="No forms yet"
        description="Create your first form to start collecting responses."
        action={<CreateFormDialog />}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell className="font-medium">
                <Link href={`/dashboard/forms/${form.id}`} className="hover:underline">
                  {form.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{form.description || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(form.createdAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isPublished}
                    onCheckedChange={async (checked) => {
                      await updateFormAsync({ formId: form.id, isPublished: checked });
                      if (checked) fireConfetti();
                    }}
                    aria-label="Toggle published"
                  />
                  <Badge variant={form.isPublished ? "default" : "secondary"}>
                    {form.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <EditFormDialog
                    form={{ id: form.id, title: form.title, description: form.description }}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Edit form">
                        <IconPencil />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    aria-label="Delete form"
                    onClick={() => {
                      if (confirm(`Delete "${form.title}"? This cannot be undone.`)) {
                        deleteFormAsync({ formId: form.id });
                      }
                    }}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
