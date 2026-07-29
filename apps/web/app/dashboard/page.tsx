import { DashboardOverview } from "~/components/dashboard-overview";
import { PageHeader } from "~/components/page-header";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <PageHeader
              title="Dashboard"
              description="An overview of your forms and responses"
            />
          </div>
          <div className="px-4 lg:px-6">
            <DashboardOverview />
          </div>
        </div>
      </div>
    </div>
  );
}
