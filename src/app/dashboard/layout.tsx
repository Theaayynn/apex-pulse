import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardMobileNav from "@/components/DashboardMobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 pt-28 pb-20">
      <DashboardMobileNav />
      <div className="flex gap-6">
        <DashboardSidebar unreadCount={unreadCount} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
