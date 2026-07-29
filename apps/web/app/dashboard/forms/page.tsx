import { CreateFormDialog } from "~/components/create-form-dialog";
import { FormsTable } from "~/components/forms-table";
import { PageHeader } from "~/components/page-header";

export default function FormsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <PageHeader
              title="Forms"
              description="Create, publish and manage your forms"
              actions={<CreateFormDialog />}
            />
          </div>
          <div className="px-4 lg:px-6">
            <FormsTable />
          </div>
        </div>
      </div>
    </div>
  );
}
