"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    const redirectTo = searchParams.get("redirect");
    router.push(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-28 pb-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="glass w-full max-w-sm rounded-2xl p-8"
      >
        <h1 className="mb-6 text-xl font-semibold">Welcome back</h1>

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

        <div className="mb-4 text-right">
          <a href="/forgot-password" className="text-xs text-accent-soft hover:underline">
            Forgot password?
          </a>
        </div>

        {serverError && <p className="mb-3 text-sm text-red-400">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-center text-sm text-foreground/60">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-accent-soft hover:underline">
            Create one
          </a>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
