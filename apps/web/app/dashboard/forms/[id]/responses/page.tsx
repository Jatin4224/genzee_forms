import Link from "next/link";

import { Button } from "~/components/ui/button";
import { FormResponses } from "~/components/form-responses";

export default async function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold">Responses</h1>
              <p className="text-muted-foreground">Submissions for this form</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/forms/${id}`}>Back to builder</Link>
            </Button>
          </div>
          <div className="px-4 lg:px-6">
            <FormResponses formId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
