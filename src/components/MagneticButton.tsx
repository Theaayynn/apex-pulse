"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "glass";
  className?: string;
}

export default function MagneticButton({
  href,
  children,
  variant = "solid",
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
    setOffset({ x, y });
  }

  const base =
    variant === "solid"
      ? "bg-accent text-white hover:bg-accent-soft"
      : "glass hover:border-accent/50";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.4 }}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors ${base} ${className}`}
    >
      {children}
    </motion.a>
  );
}

// Re-export a Link-based non-magnetic variant for places that shouldn't have the effect
// (kept in the same file so callers only need one import path).
export function StaticButton({ href, children, variant = "solid", className = "" }: MagneticButtonProps) {
  const base =
    variant === "solid"
      ? "bg-accent text-white hover:bg-accent-soft"
      : "glass hover:border-accent/50";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors ${base} ${className}`}
    >
      {children}
    </Link>
  );
}
