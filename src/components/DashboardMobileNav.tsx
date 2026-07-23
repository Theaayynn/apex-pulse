"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/support", label: "Support" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <div className="glass mb-6 flex gap-1 overflow-x-auto rounded-full p-1.5 lg:hidden">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active ? "bg-accent text-white" : "text-foreground/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
