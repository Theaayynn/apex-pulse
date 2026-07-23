"use client";

import { useRouter, usePathname } from "next/navigation";

const OPTIONS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/case-studies", label: "Case Studies" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/careers", label: "Careers" },
  { href: "/admin/support", label: "Support Tickets" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

export default function AdminMobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={pathname}
      onChange={(e) => router.push(e.target.value)}
      className="glass mb-6 w-full rounded-xl px-4 py-3 text-sm lg:hidden"
    >
      {OPTIONS.map((o) => (
        <option key={o.href} value={o.href} className="bg-background">
          {o.label}
        </option>
      ))}
    </select>
  );
}
