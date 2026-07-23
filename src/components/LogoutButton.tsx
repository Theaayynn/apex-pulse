"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={`rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-red-400/50 hover:text-red-400 ${className}`}
    >
      Sign out
    </button>
  );
}
