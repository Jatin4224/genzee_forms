import { CommandPalette } from "~/components/command-palette"
import { DashboardGuard } from "~/components/dashboard-guard"
import { DashboardSidebar } from "~/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardGuard>
      <CommandPalette />
      <div className="bg-aurora flex h-svh w-full flex-col overflow-hidden md:flex-row">
        <DashboardSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </DashboardGuard>
  )
}
