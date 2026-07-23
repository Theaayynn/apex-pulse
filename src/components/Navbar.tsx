"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

interface MeResponse {
  user?: { name: string };
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MeResponse | null) => setUserName(data?.user?.name ?? null))
      .catch(() => setUserName(null));
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5 mx-4 sm:mx-auto">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Apex<span className="text-accent-soft">Pulse</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {userName ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-soft"
            >
              {userName.split(" ")[0]}&apos;s Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-foreground/70 hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-soft"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass mx-4 mt-2 flex flex-col gap-1 rounded-2xl p-4 md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {userName ? (
                <Link href="/dashboard" className="rounded-lg bg-accent px-3 py-2.5 text-center text-sm font-medium text-white">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="rounded-lg px-3 py-2.5 text-center text-sm text-foreground/80 hover:bg-white/5">
                    Sign in
                  </Link>
                  <Link href="/register" className="rounded-lg bg-accent px-3 py-2.5 text-center text-sm font-medium text-white">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
