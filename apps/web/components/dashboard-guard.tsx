"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useUser } from "~/hooks/api/auth";

//client-side auth guard: the auth cookie lives on the API domain, so a server
//component on Vercel can't read it. Instead we ask the API who the user is.
export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user?.id) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="shimmer text-muted-foreground text-lg font-medium">Loading&hellip;</p>
      </div>
    );
  }

  //not logged in: render nothing while the redirect above runs
  if (!user?.id) return null;

  return <>{children}</>;
}
