"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema } from "@/lib/validations/user";
import type { z } from "zod";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { useState } from "react";

type TicketInput = z.infer<typeof createTicketSchema>;

export default function NewTicketPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: "MEDIUM" },
  });

  async function onSubmit(data: TicketInput) {
    setServerError(null);
    const res = await fetch("/api/user/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    router.push(`/dashboard/support/${json.ticket.id}`);
  }

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">New support ticket</h1>
      </Reveal>
      <Reveal delay={0.05}>
        <GlassCard className="max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Subject</label>
              <input
                {...register("subject")}
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                placeholder="Briefly summarize the issue"
              />
              {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm text-foreground/70">Priority</label>
              <select
                {...register("priority")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-foreground/70">Description</label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
                placeholder="What's happening? Include steps to reproduce if relevant."
              />
              {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
            </div>

            {serverError && <p className="text-sm text-red-400">{serverError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit ticket"}
            </button>
          </form>
        </GlassCard>
      </Reveal>
    </div>
  );
}
