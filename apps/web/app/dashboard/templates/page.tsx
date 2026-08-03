import { PageHeader } from "~/components/page-header";
import { TemplatesGallery } from "~/components/templates-gallery";

export default function TemplatesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <PageHeader
              title="Templates"
              description="Every template asks the same questions — only the look changes. Pick one to start a new form in that style."
            />
          </div>
          <div className="px-4 lg:px-6">
            <TemplatesGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
