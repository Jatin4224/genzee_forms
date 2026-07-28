"use client";

import { toast } from "sonner";

import { useGetFormMeta, useUpdateForm } from "~/hooks/api/form";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { ShareFormButton } from "~/components/share-form-button";

export function FormPublishControls({ formId }: { formId: string }) {
  const { form, isLoading } = useGetFormMeta(formId);
  const { updateFormAsync } = useUpdateForm();

  if (isLoading || !form) {
    return <Skeleton className="h-9 w-52" />;
  }

  const onToggle = async (checked: boolean) => {
    await updateFormAsync({ formId, isPublished: checked });
    toast.success(checked ? "Form published" : "Form unpublished");
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch id="publish" checked={form.isPublished} onCheckedChange={onToggle} />
        <Label htmlFor="publish" className="cursor-pointer">
          <Badge variant={form.isPublished ? "default" : "secondary"}>
            {form.isPublished ? "Published" : "Draft"}
          </Badge>
        </Label>
      </div>
      <ShareFormButton formId={formId} disabled={!form.isPublished} />
    </div>
  );
}
