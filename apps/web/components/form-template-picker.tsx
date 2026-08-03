"use client";

import { toast } from "sonner";

import { useGetFormMeta, useUpdateForm } from "~/hooks/api/form";
import {
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

  const onChange = async (template: string) => {
    await updateFormAsync({ formId, template: template as FormTemplateId });
    toast.success(`Style set to ${FORM_TEMPLATES[template as FormTemplateId].name}`);
  };

  return (
    <Select value={form.template} onValueChange={onChange}>
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
