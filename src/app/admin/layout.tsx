import { requireAdmin } from "@/lib/require-admin";
import AdminSidebar from "@/components/AdminSidebar";
import AdminMobileNav from "@/components/AdminMobileNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
      <AdminMobileNav />
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
