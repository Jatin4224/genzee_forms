"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconClipboardText,
  IconDashboard,
  IconInnerShadowTop,
  IconLayoutGrid,
  IconLogout,
  IconSearch,
} from "@tabler/icons-react";

import { useSignout, useUser } from "~/hooks/api/auth";
import { ThemeToggle } from "~/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Sidebar,
  SidebarBody,
  SidebarLabel,
  SidebarLink,
  type SidebarLinkItem,
} from "~/components/ui/animated-sidebar";

const links: SidebarLinkItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconDashboard className="h-5 w-5 shrink-0 text-foreground" />,
  },
  {
    label: "Forms",
    href: "/dashboard/forms",
    icon: <IconClipboardText className="h-5 w-5 shrink-0 text-foreground" />,
  },
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: <IconLayoutGrid className="h-5 w-5 shrink-0 text-foreground" />,
  },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0]![0]! + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const { logoutAsync } = useSignout();
  const router = useRouter();

  const onLogout = async () => {
    await logoutAsync();
    router.replace("/login");
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Brand */}
          <Link href="/dashboard/forms" className="flex items-center gap-2 py-1">
            <IconInnerShadowTop className="h-6 w-6 shrink-0 text-primary" />
            <SidebarLabel className="font-semibold text-foreground">Genzee Forms</SidebarLabel>
          </Link>

          {/* Search (opens the ⌘K command palette) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("genzee:command-open"))}
            className="group/sidebar mt-8 flex items-center justify-start gap-2 rounded-md py-2 text-foreground transition-[padding,background-color] duration-150 hover:bg-sidebar-accent hover:px-2 hover:text-sidebar-accent-foreground"
          >
            <IconSearch className="h-5 w-5 shrink-0" />
            <SidebarLabel className="flex-1 text-left text-muted-foreground">Search</SidebarLabel>
            <SidebarLabel className="rounded border px-1.5 text-[10px] text-muted-foreground">
              ⌘K
            </SidebarLabel>
          </button>

          {/* Nav */}
          <div className="mt-1 flex flex-col gap-1">
            {links.map((link) => (
              <SidebarLink key={link.href} link={link} />
            ))}
          </div>
        </div>

        {/* Theme + user + logout */}
        <div className="flex flex-col gap-1">
          <ThemeToggle />
          <div className="flex items-center gap-2 py-2">
            <Avatar className="h-7 w-7 shrink-0 rounded-lg">
              <AvatarImage src={user?.profileImageUrl ?? ""} alt={user?.fullName ?? ""} />
              <AvatarFallback className="rounded-lg text-xs">
                {initials(user?.fullName ?? "")}
              </AvatarFallback>
            </Avatar>
            <SidebarLabel className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {user?.fullName ?? ""}
              </span>
            </SidebarLabel>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="group/sidebar flex items-center justify-start gap-2 rounded-md py-2 text-foreground transition-[padding,background-color] duration-150 hover:bg-sidebar-accent hover:px-2 hover:text-sidebar-accent-foreground"
          >
            <IconLogout className="h-5 w-5 shrink-0" />
            <SidebarLabel className="transition duration-150 group-hover/sidebar:translate-x-1">
              Log out
            </SidebarLabel>
          </button>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
