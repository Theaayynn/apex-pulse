"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validations/forms";
import type { z } from "zod";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import { Mail, MessageSquare, Phone } from "lucide-react";

type ContactInput = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    setStatus("idle");
    const res = await fetch("/api/forms/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("success");
    reset();
  }

  return (
    <main className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-accent-soft">
            Contact
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Let&apos;s talk</h1>
          <p className="mt-6 text-foreground/60">
            Questions about a project, pricing, or the platform itself — we read every message.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.3fr]">
        <Reveal className="space-y-4">
          <GlassCard className="flex items-center gap-4">
            <Mail className="text-accent-soft" size={20} />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-foreground/50">hello@apexpulse.com</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-4">
            <Phone className="text-accent-soft" size={20} />
            <div>
              <p className="text-sm font-medium">Prefer a call?</p>
              <p className="text-sm text-foreground/50">Request a callback below</p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-4">
            <MessageSquare className="text-accent-soft" size={20} />
            <div>
              <p className="text-sm font-medium">Response time</p>
              <p className="text-sm text-foreground/50">Usually within one business day</p>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard>
            {status === "success" ? (
              <p className="py-8 text-center text-sm text-accent-glow">
                Message sent — we&apos;ll get back to you shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Honeypot — hidden from real users via CSS, catches simple bots */}
                <input
                  {...register("company")}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute -left-[9999px] h-0 w-0"
                  aria-hidden="true"
                />

                <div>
                  <input
                    {...register("name")}
                    placeholder="Name"
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                </div>

                <div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div>
                  <input
                    {...register("phone")}
                    placeholder="Phone (optional)"
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <textarea
                    {...register("message")}
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-400">Something went wrong — please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </main>
  );
}
