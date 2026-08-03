import { PublicForm } from "~/components/public-form";

export default async function PublicFormPage({ params }: { params: Promise<{ form_id: string }> }) {
  const { form_id } = await params;

  return (
    //bare on purpose: each template paints its own surface, so a full-viewport
    //style like Conversation can go edge to edge
    <main className="min-h-screen">
      <PublicForm formId={form_id} />
    </main>
  );
}
