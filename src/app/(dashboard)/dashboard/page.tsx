import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dashboardService } from "@/server/services/dashboardService";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import type { DashboardStatsDTO } from "@/types/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const rawStats = await dashboardService.getStats(session.user.id);

  const stats: DashboardStatsDTO = {
    ...rawStats,
    recentPRs: rawStats.recentPRs.map((pr) => ({ ...pr, date: pr.date.toISOString() })),
    recentActivity: rawStats.recentActivity.map((a) => ({ ...a, date: a.date.toISOString() })),
  };

  return <DashboardOverview userName={session.user.name} stats={stats} />;
}
