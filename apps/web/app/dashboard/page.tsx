import { DashboardHero } from "~/components/dashboard-hero";
import { DashboardOverview } from "~/components/dashboard-overview";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:py-6">
          <div className="px-4 lg:px-6">
            <DashboardHero />
          </div>
          <div className="px-4 lg:px-6">
            <DashboardOverview />
          </div>
        </div>
      </div>
    </div>
  );
}
