"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [pwStatus, setPwStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onChangePassword(data: ChangePasswordInput) {
    setPwStatus("idle");
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setPwStatus("error");
      setPwError(json.error ?? "Something went wrong.");
      return;
    }
    setPwStatus("saved");
    reset();
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <GlassCard className="mb-6">
          <h2 className="mb-4 text-base font-medium">Change password</h2>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Current password</label>
              <input
                {...register("currentPassword")}
                type="password"
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              {errors.currentPassword && <p className="mt-1 text-xs text-red-400">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-foreground/70">New password</label>
              <input
                {...register("newPassword")}
                type="password"
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              {errors.newPassword && <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>}
            </div>

            {pwStatus === "saved" && (
              <p className="text-sm text-accent-glow">Password changed. Redirecting to sign in…</p>
            )}
            {pwStatus === "error" && <p className="text-sm text-red-400">{pwError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </button>
          </form>
        </GlassCard>
      </Reveal>

      <Reveal delay={0.1}>
        <DangerZone />
      </Reveal>
    </div>
  );
}

function DangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/user/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirm: true }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <GlassCard className="border-red-500/20">
      <div className="mb-4 flex items-center gap-2 text-red-400">
        <AlertTriangle size={18} />
        <h2 className="text-base font-medium">Danger zone</h2>
      </div>
      <p className="mb-4 text-sm text-foreground/55">
        Deleting your account deactivates it immediately and signs you out everywhere. Your order
        and invoice history is retained for accounting purposes but is no longer linked to a login.
      </p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          Delete account
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full rounded-lg border border-red-500/30 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-red-400"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={submitting || !password}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {submitting ? "Deleting…" : "Confirm deletion"}
            </button>
            <button
              onClick={() => { setOpen(false); setPassword(""); setError(""); }}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
