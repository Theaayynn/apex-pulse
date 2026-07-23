"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});
type FormInput = z.infer<typeof formSchema>;

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(formSchema) });

  async function onSubmit(data: FormInput) {
    if (!token) {
      setServerError("Missing reset token.");
      return;
    }
    setServerError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-28 pb-16">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="mb-4 text-xl font-semibold">Set a new password</h1>
        {success ? (
          <p className="text-sm text-accent-glow">Password reset. Redirecting to sign in...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("password")}
              type="password"
              className="mb-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="New password"
            />
            {errors.password && <p className="mb-3 text-xs text-red-400">{errors.password.message}</p>}
            {serverError && <p className="mb-3 text-sm text-red-400">{serverError}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
