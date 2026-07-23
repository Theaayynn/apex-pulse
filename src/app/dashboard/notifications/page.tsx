"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import Reveal from "@/components/Reveal";
import { Bell, BellOff, Mail, MessageSquare, Smartphone } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

const CHANNEL_ICON: Record<string, typeof Mail> = {
  EMAIL: Mail,
  SMS: Smartphone,
  WHATSAPP: MessageSquare,
  IN_APP: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  async function load() {
    const res = await fetch("/api/user/notifications");
    const json = await res.json();
    setNotifications(json.notifications);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? null);
    await fetch(`/api/user/notifications/${id}`, { method: "PATCH" });
  }

  async function markAllRead() {
    setNotifications((prev) => prev?.map((n) => ({ ...n, isRead: true })) ?? null);
    await fetch("/api/user/notifications/read-all", { method: "POST" });
  }

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-accent-soft hover:underline">
              Mark all as read
            </button>
          )}
        </div>
      </Reveal>

      {notifications === null ? (
        <p className="text-sm text-foreground/50">Loading…</p>
      ) : notifications.length === 0 ? (
        <GlassCard className="flex flex-col items-center py-16 text-center">
          <BellOff className="mb-3 text-foreground/30" size={28} />
          <p className="text-sm text-foreground/50">You&apos;re all caught up — nothing here yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = CHANNEL_ICON[n.channel] ?? Bell;
            return (
              <Reveal key={n.id} delay={Math.min(i * 0.04, 0.3)}>
                <button
                  onClick={() => !n.isRead && markRead(n.id)}
                  className="w-full text-left"
                >
                  <GlassCard className={`flex items-start gap-3 ${!n.isRead ? "border-accent/30" : "opacity-70"}`}>
                    <Icon size={16} className="mt-0.5 shrink-0 text-accent-soft" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{n.title}</p>
                        {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                      </div>
                      <p className="mt-0.5 text-sm text-foreground/55">{n.body}</p>
                      <p className="mt-1 text-xs text-foreground/35">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </GlassCard>
                </button>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
