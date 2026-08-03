"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import { useCreateForm } from "~/hooks/api/form";
import { CharacterExpressionPicker } from "~/components/character-expression-picker";
import {
  DEFAULT_CHARACTER_EXPRESSION,
  DEFAULT_TEMPLATE_ID,
  FORM_TEMPLATES,
  encodeFieldDescription,
  type CharacterExpression,
  type FormTemplateId,
} from "~/components/form-templates";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "~/components/ui/textarea";

const FIELD_TYPES = ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"] as const;

type FieldValue = {
  label: string;
  type: (typeof FIELD_TYPES)[number];
  placeholder?: string;
  isRequired: boolean;
  //only asked for - and only used by - the Conversation style
  expression: CharacterExpression;
};

type CreateFormValues = {
  title: string;
  description?: string;
  fields: FieldValue[];
};

//turn "Full Name" -> "full_name" so it can be used as a key to read the answer
function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const emptyField: FieldValue = {
  label: "",
  type: "TEXT",
  placeholder: "",
  isRequired: false,
  expression: DEFAULT_CHARACTER_EXPRESSION,
};

interface CreateFormDialogProps {
  //the style the new form is created with. drives whether each field is asked for
  //a character expression, since only Conversation renders one
  template?: FormTemplateId;
  //replaces the default "New Form" button, so the templates gallery can open the
  //same dialog from its own card
  trigger?: React.ReactNode;
}

export function CreateFormDialog({
  template = DEFAULT_TEMPLATE_ID,
  trigger,
}: CreateFormDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { createFormAsync, isError, error } = useCreateForm();

  const asksForExpression = template === "CONVERSATION";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateFormValues>({
    defaultValues: {
      title: "",
      description: "",
      fields: [emptyField],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

  const onSubmit = async (values: CreateFormValues) => {
    const { id } = await createFormAsync({
      title: values.title,
      description: values.description || undefined,
      template,
      fields: values.fields.map((field, idx) => ({
        label: field.label,
        labelKey: slugify(field.label) || `field_${idx + 1}`,
        //the expression rides along in the description column - see character.ts
        description: encodeFieldDescription(field.expression),
        placeholder: field.placeholder || undefined,
        isRequired: field.isRequired,
        index: idx + 1, //position of the field within the form
        type: field.type,
      })),
    });

    reset();
    setOpen(false);

    //land on the builder so the form can be arranged and published straight away -
    //the gallery has no other way back to what was just created
    router.push(`/dashboard/forms/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <IconPlus />
            New Form
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
          <DialogDescription>
            Give your form a title and add the fields you want to collect. It will use the{" "}
            <span className="text-foreground">{FORM_TEMPLATES[template].name}</span> style.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" placeholder="Contact us" required {...register("title")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              placeholder="What is this form for?"
              {...register("description")}
            />
          </Field>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fields</span>
              <Button type="button" variant="outline" size="sm" onClick={() => append(emptyField)}>
                <IconPlus />
                Add field
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-end gap-3">
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`fields.${index}.label`}>Label</FieldLabel>
                    <Input
                      id={`fields.${index}.label`}
                      placeholder="Full name"
                      required
                      {...register(`fields.${index}.label` as const)}
                    />
                  </Field>

                  <Field className="w-40">
                    <FieldLabel>Type</FieldLabel>
                    <Controller
                      control={control}
                      name={`fields.${index}.type` as const}
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

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label="Remove field"
                  >
                    <IconTrash />
                  </Button>
                </div>

                <Field>
                  <FieldLabel htmlFor={`fields.${index}.placeholder`}>Placeholder</FieldLabel>
                  <Input
                    id={`fields.${index}.placeholder`}
                    placeholder="Optional"
                    {...register(`fields.${index}.placeholder` as const)}
                  />
                </Field>

                {asksForExpression && (
                  <Controller
                    control={control}
                    name={`fields.${index}.expression` as const}
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
                  name={`fields.${index}.isRequired` as const}
                  render={({ field: requiredField }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={requiredField.value}
                        onCheckedChange={requiredField.onChange}
                      />
                      Required
                    </label>
                  )}
                />
              </div>
            ))}
          </div>

          {isError && (
            <p className="text-sm text-destructive">
              {error?.message ?? "Something went wrong while creating the form."}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create form"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
