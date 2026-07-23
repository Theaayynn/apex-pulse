"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema } from "@/lib/validations/user";
import type { z } from "zod";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { Camera, User as UserIcon } from "lucide-react";

type ProfileInput = z.infer<typeof updateProfileSchema>;

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [avatarStatus, setAvatarStatus] = useState<"idle" | "uploading" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(updateProfileSchema) });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.user);
        reset({ name: data.user.name, phone: data.user.phone ?? "" });
      });
  }, [reset]);

  async function onSubmit(data: ProfileInput) {
    setStatus("idle");
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    const json = await res.json();
    setProfile((p) => (p ? { ...p, ...json.user } : p));
    setStatus("saved");
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setAvatarStatus("error");
      return;
    }

    setAvatarStatus("uploading");
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: reader.result }),
      });
      if (!res.ok) {
        setAvatarStatus("error");
        return;
      }
      const json = await res.json();
      setProfile((p) => (p ? { ...p, avatarUrl: json.avatarUrl } : p));
      setAvatarStatus("idle");
    };
    reader.readAsDataURL(file);
  }

  if (!profile) {
    return <p className="text-sm text-foreground/50">Loading profile…</p>;
  }

  return (
    <div>
      <Reveal>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Profile</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <GlassCard className="mb-6 flex items-center gap-5">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.name} width={64} height={64} className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="text-foreground/40" size={24} />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white"
              aria-label="Change avatar"
            >
              <Camera size={12} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
          </div>
          <div>
            <p className="font-medium">{profile.name}</p>
            <p className="text-sm text-foreground/50">{profile.email}</p>
            {avatarStatus === "uploading" && <p className="mt-1 text-xs text-accent-soft">Uploading…</p>}
            {avatarStatus === "error" && (
              <p className="mt-1 text-xs text-red-400">Upload failed — check file size (max 4MB) or Cloudinary config.</p>
            )}
          </div>
        </GlassCard>
      </Reveal>

      <Reveal delay={0.1}>
        <GlassCard>
          <h2 className="mb-4 text-base font-medium">Personal information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Name</label>
              <input
                {...register("name")}
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Phone</label>
              <input
                {...register("phone")}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Email</label>
              <input
                value={profile.email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-border bg-white/[0.02] px-3 py-2.5 text-sm text-foreground/40"
              />
              <p className="mt-1 text-xs text-foreground/40">Email changes aren&apos;t supported yet — contact support if needed.</p>
            </div>

            {status === "saved" && <p className="text-sm text-accent-glow">Saved.</p>}
            {status === "error" && <p className="text-sm text-red-400">Something went wrong — please try again.</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-soft disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </form>
        </GlassCard>
      </Reveal>
    </div>
  );
}
