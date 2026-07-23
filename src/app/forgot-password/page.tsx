"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-28 pb-16">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="mb-2 text-xl font-semibold">Reset your password</h1>
        {sent ? (
          <p className="text-sm text-foreground/60">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mb-4 text-sm text-foreground/60">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <input
              {...register("email")}
              type="email"
              className="mb-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mb-3 text-xs text-red-400">{errors.email.message}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
