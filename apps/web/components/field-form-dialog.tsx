"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useCreateField, useUpdateField } from "~/hooks/api/form-field";
import { CharacterExpressionPicker } from "~/components/character-expression-picker";
import {
  DEFAULT_CHARACTER_EXPRESSION,
  encodeFieldDescription,
  parseFieldDescription,
  type CharacterExpression,
  type FormTemplateId,
} from "~/components/form-templates";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Field, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const FIELD_TYPES = ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"] as const;

type FieldType = (typeof FIELD_TYPES)[number];

//turn "Full Name" -> "full_name"; used only when a field is first created
export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

type FieldFormValues = {
  label: string;
  type: FieldType;
  placeholder: string;
  isRequired: boolean;
  //the face the character pulls while asking this question in the Conversation style
  expression: CharacterExpression;
};

type ExistingField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder: string | null;
  isRequired: boolean;
  //raw description column; the expression is encoded inside it
  description: string | null;
};

type FieldFormDialogProps = {
  formId: string;
  trigger: React.ReactNode;
  //create mode: the fractional index the new field should take
  nextIndex?: number;
  //edit mode: the field being edited (labelKey is intentionally not editable)
  field?: ExistingField;
  //the style this form renders with, so the expression is only asked for when it shows
  template?: FormTemplateId;
};

export function FieldFormDialog({
  formId,
  trigger,
  nextIndex,
  field,
  template,
}: FieldFormDialogProps) {
  const asksForExpression = template === "CONVERSATION";
  const isEdit = Boolean(field);
  const [open, setOpen] = useState(false);

  const { createFieldAsync } = useCreateField();
  const { updateFieldAsync } = useUpdateField();

  //the expression shares the description column with any helper text already on the
  //field, so read both out on open and write both back on save
  const parsed = parseFieldDescription(field?.description);

  const { register, control, handleSubmit, reset } = useForm<FieldFormValues>({
    defaultValues: {
      label: field?.label ?? "",
      type: field?.type ?? "TEXT",
      placeholder: field?.placeholder ?? "",
      isRequired: field?.isRequired ?? false,
      expression: field ? parsed.expression : DEFAULT_CHARACTER_EXPRESSION,
    },
  });

  //when opening the edit dialog, refresh the form with the field's current values
  useEffect(() => {
    if (open && field) {
      const current = parseFieldDescription(field.description);

      reset({
        label: field.label,
        type: field.type,
        placeholder: field.placeholder ?? "",
        isRequired: field.isRequired,
        expression: current.expression,
      });
    }
  }, [open, field, reset]);

  const onSubmit = async (values: FieldFormValues) => {
    const description = encodeFieldDescription(values.expression, parsed.helperText);

    if (isEdit && field) {
      //labelKey is never sent, so the slug stays stable across edits
      await updateFieldAsync({
        id: field.id,
        label: values.label,
        description,
        placeholder: values.placeholder || null,
        isRequired: values.isRequired,
        type: values.type,
      });
    } else {
      await createFieldAsync({
        formId,
        label: values.label,
        labelKey: slugify(values.label) || `field_${Date.now()}`,
        description,
        placeholder: values.placeholder || undefined,
        isRequired: values.isRequired,
        index: nextIndex ?? 1,
        type: values.type,
      });
    }

    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit field" : "Add field"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="field-label">Label</FieldLabel>
            <Input id="field-label" placeholder="Full name" required {...register("label")} />
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <Controller
              control={control}
              name="type"
              render={({ field: typeField }) => (
                <Select value={typeField.value} onValueChange={typeField.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="field-placeholder">Placeholder</FieldLabel>
            <Input id="field-placeholder" placeholder="Optional" {...register("placeholder")} />
          </Field>

          {asksForExpression && (
            <Controller
              control={control}
              name="expression"
              render={({ field: expressionField }) => (
                <CharacterExpressionPicker
                  value={expressionField.value}
                  onChange={expressionField.onChange}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="isRequired"
            render={({ field: requiredField }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={requiredField.value} onCheckedChange={requiredField.onChange} />
                Required
              </label>
            )}
          />

          <DialogFooter>
            <Button type="submit">{isEdit ? "Save changes" : "Add field"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
