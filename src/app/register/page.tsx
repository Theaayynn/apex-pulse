"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-28 pb-16">
        <div className="glass max-w-sm rounded-2xl p-8 text-center">
          <h1 className="mb-2 text-xl font-semibold">Check your inbox</h1>
          <p className="text-sm text-foreground/60">
            We sent a verification link to your email. Click it to activate your account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-28 pb-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass w-full max-w-sm rounded-2xl p-8"
      >
        <h1 className="mb-6 text-xl font-semibold">Create your account</h1>

        <label className="mb-1 block text-sm text-foreground/70">Name</label>
        <input
          {...register("name")}
          className="mb-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="Jane Doe"
        />
        {errors.name && <p className="mb-3 text-xs text-red-400">{errors.name.message}</p>}

        <label className="mb-1 block text-sm text-foreground/70">Email</label>
        <input
          {...register("email")}
          type="email"
          className="mb-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="you@example.com"
        />
        {errors.email && <p className="mb-3 text-xs text-red-400">{errors.email.message}</p>}

        <label className="mb-1 block text-sm text-foreground/70">Password</label>
        <input
          {...register("password")}
          type="password"
          className="mb-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="••••••••"
        />
        {errors.password && <p className="mb-3 text-xs text-red-400">{errors.password.message}</p>}

        {serverError && <p className="mb-3 text-sm text-red-400">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm text-foreground/60">
          Already have an account?{" "}
          <a href="/login" className="text-accent-soft hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
