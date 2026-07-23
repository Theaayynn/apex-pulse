"use client";

import { useEffect, useState, useCallback } from "react";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import AdminTable, { type Column } from "@/components/AdminTable";
import { Search } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "EMPLOYEE", "CUSTOMER"];

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/15 text-red-400",
  ADMIN: "bg-accent/15 text-accent-soft",
  EMPLOYEE: "bg-yellow-500/15 text-yellow-400",
  CUSTOMER: "bg-white/10 text-foreground/60",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    setUsers(json.users ?? []);
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function updateUser(id: string, data: Partial<{ role: string; isActive: boolean }>) {
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    load();
  }

  const columns: Column<AdminUser>[] = [
    {
      header: "Name",
      render: (u) => (
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-xs text-foreground/40">{u.email}</p>
        </div>
      ),
    },
    {
      header: "Role",
      render: (u) => (
        <select
          value={u.role}
          onChange={(e) => updateUser(u.id, { role: e.target.value })}
          className={`rounded-full border-0 px-2.5 py-1 text-xs outline-none ${ROLE_STYLES[u.role]}`}
        >
          {ROLES.map((r) => (
            <option key={r} value={r} className="bg-background text-foreground">
              {r}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Status",
      render: (u) => (
        <span className={u.isActive ? "text-accent-glow" : "text-red-400"}>
          {u.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Verified",
      render: (u) => (u.isEmailVerified ? "Yes" : "No"),
    },
    {
      header: "Last login",
      render: (u) => (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"),
    },
    {
      header: "Actions",
      render: (u) => (
        <button
          onClick={() => updateUser(u.id, { isActive: !u.isActive })}
          className="text-xs text-accent-soft hover:underline"
        >
          {u.isActive ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Users</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <GlassCard className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </GlassCard>
      </Reveal>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <Reveal delay={0.1}>
        {users === null ? (
          <p className="text-sm text-foreground/50">Loading…</p>
        ) : (
          <AdminTable columns={columns} rows={users} keyField={(u) => u.id} emptyMessage="No users match your filters." />
        )}
      </Reveal>
    </div>
  );
}
