"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical, IconListDetails, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import { useDeleteField, useGetFields, useUpdateField } from "~/hooks/api/form-field";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/empty-state";
import { FieldFormDialog } from "~/components/field-form-dialog";
import { FieldTypeBadge } from "~/components/field-type-badge";
import { cn } from "~/lib/utils";

const FIELD_TYPES = ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"] as const;
type FieldType = (typeof FIELD_TYPES)[number];

type Field = {
  id: string;
  label: string;
  labelKey: string;
  description: string | null;
  placeholder: string | null;
  isRequired: boolean;
  index: string;
  type: string;
};

function SortableFieldRow({
  field,
  formId,
  onDelete,
}: {
  field: Field;
  formId: string;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-elevate transition-shadow duration-200 hover:shadow-elevate-lg",
        isDragging && "z-10 shadow-elevate-lg",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="size-5" />
        </button>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{field.label}</span>
            <FieldTypeBadge type={field.type} />
            {field.isRequired && <Badge>Required</Badge>}
          </div>
          <span className="truncate text-xs text-muted-foreground">
            key: {field.labelKey}
            {field.placeholder ? ` · placeholder: ${field.placeholder}` : ""}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
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
          onClick={() => onDelete(field.id)}
          aria-label="Delete field"
        >
          <IconTrash />
        </Button>
      </div>
    </div>
  );
}

export function FormBuilder({ formId }: { formId: string }) {
  const { fields, isLoading } = useGetFields(formId);
  const { updateFieldAsync } = useUpdateField();
  const { deleteFieldAsync } = useDeleteField();

  //local copy so drag reordering is instant; re-syncs whenever the server data changes
  const [items, setItems] = useState<Field[]>([]);
  useEffect(() => {
    setItems(fields ?? []);
  }, [fields]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nextIndex = items.length
    ? Math.max(...items.map((field) => Number(field.index))) + 1
    : 1;

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldPos = items.findIndex((f) => f.id === active.id);
    const newPos = items.findIndex((f) => f.id === over.id);
    if (oldPos === -1 || newPos === -1) return;

    const reordered = arrayMove(items, oldPos, newPos);
    setItems(reordered); //optimistic

    //give the moved field a fractional index between its new neighbours
    const prev = reordered[newPos - 1];
    const next = reordered[newPos + 1];
    let newIndex: number;
    if (prev && next) newIndex = (Number(prev.index) + Number(next.index)) / 2;
    else if (next) newIndex = Number(next.index) - 1;
    else if (prev) newIndex = Number(prev.index) + 1;
    else return;

    await updateFieldAsync({ id: String(active.id), index: newIndex });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  const addFieldButton = (
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
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {items.length} field{items.length === 1 ? "" : "s"}
        </span>
        {addFieldButton}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconListDetails />}
          title="No fields yet"
          description="Add your first field to start building this form."
          action={addFieldButton}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={items.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {items.map((field) => (
                <SortableFieldRow
                  key={field.id}
                  field={field}
                  formId={formId}
                  onDelete={(id) => deleteFieldAsync({ id })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
