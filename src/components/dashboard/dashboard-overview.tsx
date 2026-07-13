import { User, Activity, Trophy } from "lucide-react";

import { WidgetCard } from "@/components/dashboard/widget-card";
import { StatCards } from "@/components/dashboard/stat-cards";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { ActivityStrip } from "@/components/dashboard/activity-strip";
import { TodaySessionCard } from "@/components/dashboard/today-session-card";
import { LastSessionCard } from "@/components/dashboard/last-session-card";
import { RecentRecordsTable } from "@/components/dashboard/recent-records-table";
import type { DashboardStatsDTO } from "@/types/dashboard";

const cardRounding = "rounded-2xl py-5 md:rounded-3xl md:[--card-spacing:--spacing(5)]";

export function DashboardOverview({ stats }: { stats: DashboardStatsDTO }) {
  return (
    <div className="flex flex-col gap-2 md:h-[calc(100vh-8rem)] md:overflow-hidden">
      <h1 className="shrink-0 font-heading text-2xl font-semibold tracking-tight">Tableau de bord</h1>

      <div className="shrink-0">
        <StatCards counts={stats.counts} weightGoal={stats.weightGoal} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-3 md:overflow-hidden">
        <WidgetCard
          title="Activité (14 jours)"
          icon={<Activity className="size-3.5" />}
          color="bg-muscle-back/12 text-muscle-back"
          index={0}
          className="md:col-span-2"
          cardClassName={cardRounding}
        >
          <ActivityStrip activity={stats.activity} />
        </WidgetCard>

        <WidgetCard
          title="Mon profil"
          icon={<User className="size-3.5" />}
          color="bg-brand/12 text-brand"
          index={1}
          cardClassName={cardRounding}
        >
          <ProfileCard profile={stats.profile} />
        </WidgetCard>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-3 md:overflow-hidden">
        <TodaySessionCard suggestedSessions={stats.suggestedSessions} />

        <LastSessionCard lastSession={stats.lastSession} />

        <WidgetCard
          title="Records récents"
          icon={<Trophy className="size-3.5" />}
          color="bg-muscle-forearms/12 text-muscle-forearms"
          index={3}
          cardClassName={cardRounding}
        >
          <RecentRecordsTable recentPRs={stats.recentPRs} />
        </WidgetCard>
      </div>
    </div>
  );
}
