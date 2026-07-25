"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "~/hooks/api/auth";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return; // wait for the query to resolve

    if (user?.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>{JSON.stringify(user, null, 2)}</div>
    </main>
  );
}
