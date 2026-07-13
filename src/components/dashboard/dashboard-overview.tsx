import Link from "next/link";
import { User, Activity, Trophy, TrendingUp } from "lucide-react";

import { MagneticButton } from "@/components/ui/magnetic-button";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { StatCards } from "@/components/dashboard/stat-cards";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { ActivityStrip } from "@/components/dashboard/activity-strip";
import { WeeklyVolumeChart } from "@/components/dashboard/weekly-volume-chart";
import { TodaySessionCard } from "@/components/dashboard/today-session-card";
import { RecentRecordsTable } from "@/components/dashboard/recent-records-table";
import { WeightGoalRing } from "@/components/dashboard/weight-goal-ring";
import { ActiveSessionCard } from "@/components/dashboard/active-session-card";
import { KineticHero } from "@/components/dashboard/kinetic-hero";
import type { DashboardStatsDTO } from "@/types/dashboard";

const cardRounding = "rounded-2xl md:rounded-3xl";

export function DashboardOverview({
  userName,
  stats,
}: {
  userName?: string | null;
  stats: DashboardStatsDTO;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <KineticHero userName={userName} />
          <p className="mt-2 text-muted-foreground">
            Voici un aperçu de ton entraînement.
          </p>
        </div>
        <MagneticButton render={<Link href="/programs" />} nativeButton={false}>
          Nouveau programme
        </MagneticButton>
      </div>

      <StatCards counts={stats.counts} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <WidgetCard
          title="Volume (7 jours)"
          icon={<TrendingUp className="size-3.5" />}
          color="bg-muscle-quadriceps/12 text-muscle-quadriceps"
          index={0}
          className="md:col-span-2"
          cardClassName={cardRounding}
        >
          <WeeklyVolumeChart weeklyVolume={stats.weeklyVolume} />
        </WidgetCard>

        <TodaySessionCard suggestedSessions={stats.suggestedSessions} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <WidgetCard
          title="Mon profil"
          icon={<User className="size-3.5" />}
          color="bg-brand/12 text-brand"
          index={1}
          cardClassName={cardRounding}
        >
          <ProfileCard profile={stats.profile} />
        </WidgetCard>

        <WidgetCard
          title="Activité (14 jours)"
          icon={<Activity className="size-3.5" />}
          color="bg-muscle-back/12 text-muscle-back"
          index={2}
          cardClassName={cardRounding}
        >
          <ActivityStrip activity={stats.activity} />
        </WidgetCard>

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <WidgetCard
          title="Objectif de poids"
          icon={<Trophy className="size-3.5" />}
          color="bg-frost/20 text-frost-foreground"
          index={4}
          className={stats.activeSession ? undefined : "md:col-span-2"}
          cardClassName={cardRounding}
        >
          <WeightGoalRing weightGoal={stats.weightGoal} />
        </WidgetCard>

        {stats.activeSession && <ActiveSessionCard activeSession={stats.activeSession} />}
      </div>
    </div>
  );
}
