"use client";

import * as React from "react";
import Link from "next/link";
import { IconClipboardText, IconInnerShadowTop } from "@tabler/icons-react";

import { useUser } from "~/hooks/api/auth";
import { NavMain } from "~/components/nav-main";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

const navMain = [
  {
    title: "Forms",
    url: "/dashboard/forms",
    icon: IconClipboardText,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard/forms">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Genzee Forms</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.fullName ?? "",
            email: user?.email ?? "",
            avatar: user?.profileImageUrl ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
