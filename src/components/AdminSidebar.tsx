"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Receipt,
  Layers,
  Ticket,
  Newspaper,
  Quote,
  Star,
  HelpCircle,
  Image as ImageIcon,
  BookOpen,
  UserPlus,
  Mail,
  Briefcase,
  LifeBuoy,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  links: NavLink[];
}

const GROUPS: NavGroup[] = [
  {
    title: "Overview",
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Billing",
    links: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/invoices", label: "Invoices", icon: Receipt },
      { href: "/admin/plans", label: "Plans", icon: Layers },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    title: "Content (CMS)",
    links: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/case-studies", label: "Case Studies", icon: BookOpen },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    ],
  },
  {
    title: "People",
    links: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/leads", label: "Leads", icon: UserPlus },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { href: "/admin/careers", label: "Careers", icon: Briefcase },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/admin/support", label: "Tickets", icon: LifeBuoy },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-28 hidden h-fit max-h-[calc(100vh-8rem)] w-60 shrink-0 space-y-5 overflow-y-auto rounded-2xl p-3 lg:block">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-foreground/35">
            {group.title}
          </p>
          <nav className="space-y-0.5">
            {group.links.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-accent/15 text-foreground" : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <link.icon size={15} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
