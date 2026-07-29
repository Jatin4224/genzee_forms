import Link from "next/link";

import { Button } from "~/components/ui/button";
import { FormBuilder } from "~/components/form-builder";
import { FormPublishControls } from "~/components/form-publish-controls";
import { PageHeader } from "~/components/page-header";

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <PageHeader
              title="Form builder"
              description="Add and arrange the fields you want to collect"
              actions={
                <>
                  <FormPublishControls formId={id} />
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/forms/${id}/responses`}>View responses</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/forms">Back to forms</Link>
                  </Button>
                </>
              }
            />
          </div>
          <div className="px-4 lg:px-6">
            <FormBuilder formId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
