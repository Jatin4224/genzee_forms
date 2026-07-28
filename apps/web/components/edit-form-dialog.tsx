"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useUpdateForm } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
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
import { Textarea } from "~/components/ui/textarea";

type EditFormValues = {
  title: string;
  description: string;
};

type EditFormDialogProps = {
  form: { id: string; title: string; description: string | null };
  trigger: React.ReactNode;
};

export function EditFormDialog({ form, trigger }: EditFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateFormAsync } = useUpdateForm();

  const { register, handleSubmit, reset } = useForm<EditFormValues>({
    defaultValues: { title: form.title, description: form.description ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ title: form.title, description: form.description ?? "" });
    }
  }, [open, form, reset]);

  const onSubmit = async (values: EditFormValues) => {
    await updateFormAsync({
      formId: form.id,
      title: values.title,
      description: values.description || null,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit form</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="edit-title">Title</FieldLabel>
            <Input id="edit-title" required {...register("title")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-description">Description</FieldLabel>
            <Textarea id="edit-description" {...register("description")} />
          </Field>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
