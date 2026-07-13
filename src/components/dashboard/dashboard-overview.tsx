import { User, Activity, Dumbbell, Trophy } from "lucide-react";

import { WidgetCard } from "@/components/dashboard/widget-card";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { ActivityStrip } from "@/components/dashboard/activity-strip";
import { SuggestedSessions } from "@/components/dashboard/suggested-sessions";
import { RecentRecordsTable } from "@/components/dashboard/recent-records-table";
import { KineticHero } from "@/components/dashboard/kinetic-hero";
import { WolfMark } from "@/components/icons/wolf-mark";
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
    <div className="flex flex-col gap-4 md:h-[calc(100vh-8rem)] md:overflow-hidden">
      <div className="relative shrink-0 overflow-hidden rounded-2xl bg-card px-6 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)] sm:px-8 md:rounded-3xl dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(0,0,0,0.6)]">
        <WolfMark
          showDetail={false}
          className="pointer-events-none absolute -top-8 -right-8 size-48 text-brand/6 dark:text-brand/20"
        />
        <div className="relative">
          <KineticHero userName={userName} />
          <p className="mt-2 text-muted-foreground">
            Voici un aperçu de ton entraînement.
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:auto-rows-fr md:grid-cols-[3fr_2fr]">
          <WidgetCard
            title="Activité (14 jours)"
            icon={<Activity className="size-3.5" />}
            color="bg-muscle-quadriceps/12 text-muscle-quadriceps"
            index={0}
            className="order-2 md:order-1"
            cardClassName={cardRounding}
            contentClassName="flex min-h-0 flex-1 flex-col"
          >
            <ActivityStrip activity={stats.activity} />
          </WidgetCard>

          <div className="order-1 flex min-h-0 flex-col gap-4 md:order-2 md:h-full md:flex-row">
            <WidgetCard
              title="Mon profil"
              icon={<User className="size-3.5" />}
              color="bg-brand/12 text-brand"
              index={1}
              className="order-1 h-auto flex-none md:order-1 md:h-full md:min-w-0 md:flex-1"
              plain
            >
              <ProfileCard profile={stats.profile} />
            </WidgetCard>

            <WidgetCard
              title="Séance du jour"
              icon={<Dumbbell className="size-3.5" />}
              color="bg-muscle-back/12 text-muscle-back"
              index={2}
              className="order-2 min-h-0 flex-1 md:order-2 md:min-w-0"
              contentClassName="flex min-h-0 flex-1 flex-col"
              plain
            >
              <SuggestedSessions suggestedSessions={stats.suggestedSessions} />
            </WidgetCard>
          </div>
        </div>

        <WidgetCard
          title="Records récents"
          icon={<Trophy className="size-3.5" />}
          color="bg-muscle-forearms/12 text-muscle-forearms"
          index={3}
          className="order-3 min-h-0 flex-1"
          contentClassName="flex min-h-0 flex-1 flex-col"
          plain
        >
          <RecentRecordsTable recentPRs={stats.recentPRs} />
        </WidgetCard>
      </div>
    </div>
  );
}
