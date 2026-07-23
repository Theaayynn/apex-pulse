import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/40 ${className}`}
    >
      {/* Animated gradient border glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{
        background: "radial-gradient(400px circle at var(--x,50%) var(--y,50%), rgba(124,92,255,0.12), transparent 60%)",
      }} />
      {children}
    </div>
  );
}
