"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { careerSchema } from "@/lib/validations/forms";
import type { z } from "zod";
import Reveal from "@/components/Reveal";
import GlassCard from "@/components/GlassCard";
import { Briefcase, MapPin } from "lucide-react";

type CareerInput = z.infer<typeof careerSchema>;

const OPEN_ROLES = [
  { title: "Senior Full-Stack Engineer", location: "Remote", type: "Full-time" },
  { title: "Product Designer", location: "Remote", type: "Full-time" },
  { title: "DevOps / Platform Engineer", location: "Remote", type: "Contract" },
];

export default function CareersPage() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CareerInput>({ resolver: zodResolver(careerSchema) });

  async function onSubmit(data: CareerInput) {
    setStatus("idle");
    const res = await fetch("/api/forms/career", {
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
            Careers
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Build with us</h1>
          <p className="mt-6 text-foreground/60">
            We're a small, senior team — every hire changes the shape of the product.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-2xl space-y-3">
        {OPEN_ROLES.map((role, i) => (
          <Reveal key={role.title} delay={i * 0.06}>
            <GlassCard className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{role.title}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-foreground/50">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {role.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} /> {role.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setValue("position", role.title)}
                className="rounded-full glass px-4 py-2 text-xs font-medium hover:border-accent/40"
              >
                Apply
              </button>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mx-auto mt-16 max-w-2xl">
        <GlassCard>
          <h2 className="mb-4 text-lg font-medium">Application</h2>
          {status === "success" ? (
            <p className="py-6 text-center text-sm text-accent-glow">
              Application received — we&apos;ll review it and reach out.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    {...register("fullName")}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
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
              </div>
              <div>
                <input
                  {...register("position")}
                  placeholder="Position you're applying for"
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
                {errors.position && <p className="mt-1 text-xs text-red-400">{errors.position.message}</p>}
              </div>
              <div>
                <input
                  {...register("resumeUrl")}
                  placeholder="Link to resume (Google Drive, Notion, etc.)"
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
                {errors.resumeUrl && <p className="mt-1 text-xs text-red-400">{errors.resumeUrl.message}</p>}
              </div>
              <div>
                <textarea
                  {...register("coverLetter")}
                  rows={4}
                  placeholder="Anything you'd like us to know (optional)"
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
              {status === "error" && <p className="text-sm text-red-400">Something went wrong — please try again.</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit application"}
              </button>
            </form>
          )}
        </GlassCard>
      </Reveal>
    </main>
  );
}
