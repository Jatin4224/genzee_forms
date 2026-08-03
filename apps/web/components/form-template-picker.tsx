"use client";

import { toast } from "sonner";

import { useGetFormMeta, useUpdateForm } from "~/hooks/api/form";
import {
  DEFAULT_TEMPLATE_ID,
  FORM_TEMPLATES,
  FORM_TEMPLATE_IDS,
  type FormTemplateId,
} from "~/components/form-templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";

//lets the owner change the visual style their published form renders with.
//options come straight from the registry, so a new template shows up here for free
export function FormTemplatePicker({ formId }: { formId: string }) {
  const { form, isLoading } = useGetFormMeta(formId);
  const { updateFormAsync } = useUpdateForm();

  if (isLoading || !form) {
    return <Skeleton className="h-9 w-36" />;
  }

  const onChange = async (value: string) => {
    const template = value as FormTemplateId;

    try {
      await updateFormAsync({ formId, template });
      toast.success(`Style set to ${FORM_TEMPLATES[template].name}`);
    } catch {
      //the hook already surfaces the failure; swallow it so the change does not
      //reject unhandled, and so the success toast never fires on a failed save
    }
  };

  return (
    //falling back keeps the select controlled: with an undefined value radix drops
    //back to its own state and would show a style the server never actually stored
    <Select value={form.template ?? DEFAULT_TEMPLATE_ID} onValueChange={onChange}>
      <SelectTrigger className="w-36" aria-label="Form style">
        <SelectValue placeholder="Style" />
      </SelectTrigger>
      <SelectContent>
        {FORM_TEMPLATE_IDS.map((id) => (
          <SelectItem key={id} value={id}>
            {FORM_TEMPLATES[id].name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
