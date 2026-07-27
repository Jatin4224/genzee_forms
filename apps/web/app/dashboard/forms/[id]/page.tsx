import Link from "next/link";

import { Button } from "~/components/ui/button";

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
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold">Form builder</h1>
              <p className="text-muted-foreground">Editing form {id}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/forms">Back to forms</Link>
            </Button>
          </div>
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Builder coming soon. This is where you&apos;ll edit the fields of form {id}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
