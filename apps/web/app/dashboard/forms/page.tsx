import { CreateFormDialog } from "~/components/create-form-dialog";
import { FormsTable } from "~/components/forms-table";

export default function FormsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-semibold">Forms</h1>
              <p className="text-muted-foreground">Manage your forms here.</p>
            </div>
            <CreateFormDialog />
          </div>
          <div className="px-4 lg:px-6">
            <FormsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
