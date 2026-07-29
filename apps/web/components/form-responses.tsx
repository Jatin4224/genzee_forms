"use client";

import { IconInbox } from "@tabler/icons-react";

import { useGetFields } from "~/hooks/api/form-field";
import { useListSubmissions } from "~/hooks/api/form-submission";
import { EmptyState } from "~/components/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

function formatDate(value: string | Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function FormResponses({ formId }: { formId: string }) {
  const { fields, isLoading: fieldsLoading } = useGetFields(formId);
  const { submissions, isLoading: submissionsLoading } = useListSubmissions(formId);

  if (fieldsLoading || submissionsLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const orderedFields = fields ?? [];

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        icon={<IconInbox />}
        title="No responses yet"
        description="Publish and share your form, and responses will show up here."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submitted</TableHead>
            {orderedFields.map((field) => (
              <TableHead key={field.id}>{field.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            //index this submission's answers by field id for quick lookup per column
            const answers = new Map(
              (submission.values ?? []).map((entry) => [entry.formFieldId, entry.value]),
            );

            return (
              <TableRow key={submission.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(submission.createdAt)}
                </TableCell>
                {orderedFields.map((field) => (
                  <TableCell key={field.id}>{answers.get(field.id) || "—"}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
