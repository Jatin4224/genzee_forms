import { PublicForm } from "~/components/public-form";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ form_id: string }>;
}) {
  const { form_id } = await params;

  return (
    <main className="min-h-screen bg-muted/30 py-10">
      <PublicForm formId={form_id} />
    </main>
  );
}
