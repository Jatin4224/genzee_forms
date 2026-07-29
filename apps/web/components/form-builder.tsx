"use client";

import {
  IconArrowDown,
  IconArrowUp,
  IconListDetails,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import { useDeleteField, useGetFields, useUpdateField } from "~/hooks/api/form-field";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/empty-state";
import { FieldFormDialog } from "~/components/field-form-dialog";
import { FieldTypeBadge } from "~/components/field-type-badge";

const FIELD_TYPES = ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"] as const;
type FieldType = (typeof FIELD_TYPES)[number];

export function FormBuilder({ formId }: { formId: string }) {
  const { fields, isLoading } = useGetFields(formId);
  const { updateFieldAsync } = useUpdateField();
  const { deleteFieldAsync } = useDeleteField();

  //fields already arrive ordered by ascending numeric index from the server
  const ordered = fields ?? [];

  //move a field by giving it a new fractional index between its target neighbours
  const move = async (position: number, direction: "up" | "down") => {
    const target = ordered[position];
    if (!target) return;

    if (direction === "up") {
      if (position === 0) return;
      const above = ordered[position - 1];
      const aboveAbove = ordered[position - 2];
      const newIndex = aboveAbove
        ? (Number(aboveAbove.index) + Number(above!.index)) / 2
        : Number(above!.index) - 1;
      await updateFieldAsync({ id: target.id, index: newIndex });
    } else {
      if (position === ordered.length - 1) return;
      const below = ordered[position + 1];
      const belowBelow = ordered[position + 2];
      const newIndex = belowBelow
        ? (Number(below!.index) + Number(belowBelow.index)) / 2
        : Number(below!.index) + 1;
      await updateFieldAsync({ id: target.id, index: newIndex });
    }
  };

  const nextIndex = ordered.length
    ? Math.max(...ordered.map((field) => Number(field.index))) + 1
    : 1;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {ordered.length} field{ordered.length === 1 ? "" : "s"}
        </span>
        <FieldFormDialog
          formId={formId}
          nextIndex={nextIndex}
          trigger={
            <Button>
              <IconPlus />
              Add field
            </Button>
          }
        />
      </div>

      {ordered.length === 0 ? (
        <EmptyState
          icon={<IconListDetails />}
          title="No fields yet"
          description="Add your first field to start building this form."
          action={
            <FieldFormDialog
              formId={formId}
              nextIndex={nextIndex}
              trigger={
                <Button>
                  <IconPlus />
                  Add field
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {ordered.map((field, position) => (
            <div
              key={field.id}
              className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-elevate transition-shadow duration-200 hover:shadow-elevate-lg"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{field.label}</span>
                  <FieldTypeBadge type={field.type} />
                  {field.isRequired && <Badge>Required</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  key: {field.labelKey}
                  {field.placeholder ? ` · placeholder: ${field.placeholder}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(position, "up")}
                  disabled={position === 0}
                  aria-label="Move up"
                >
                  <IconArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(position, "down")}
                  disabled={position === ordered.length - 1}
                  aria-label="Move down"
                >
                  <IconArrowDown />
                </Button>

                <FieldFormDialog
                  formId={formId}
                  field={{
                    id: field.id,
                    label: field.label,
                    type: field.type as FieldType,
                    placeholder: field.placeholder,
                    isRequired: field.isRequired,
                  }}
                  trigger={
                    <Button type="button" variant="ghost" size="icon" aria-label="Edit field">
                      <IconPencil />
                    </Button>
                  }
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => deleteFieldAsync({ id: field.id })}
                  aria-label="Delete field"
                >
                  <IconTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
