"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setStatus("success");
        setMessage(json.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message ?? "Verification failed.");
      });
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-28 pb-16">
      <div className="glass max-w-sm rounded-2xl p-8 text-center">
        {status === "loading" && <p className="text-sm text-foreground/60">Verifying your email...</p>}
        {status === "success" && (
          <>
            <h1 className="mb-2 text-xl font-semibold text-accent-glow">Email verified!</h1>
            <p className="mb-4 text-sm text-foreground/60">{message}</p>
            <a href="/login" className="text-sm text-accent-soft hover:underline">
              Go to sign in
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="mb-2 text-xl font-semibold text-red-400">Verification failed</h1>
            <p className="text-sm text-foreground/60">{message}</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
