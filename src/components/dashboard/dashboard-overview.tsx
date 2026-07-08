"use client";

import Link from "next/link";
import {
  Flame,
  Dumbbell,
  Trophy,
  Weight,
  Activity,
  Sparkles,
  HeartPulse,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { muscleGroupOrder, muscleGroupLabels, muscleGroupColorClasses } from "@/lib/constants";
import { StartSessionButton } from "@/components/workout/start-session-button";
import { useUnit } from "@/hooks/use-unit";
import { WolfMark } from "@/components/icons/wolf-mark";
import type { DashboardStatsDTO } from "@/types/dashboard";

function formatRelativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days} jours`;
}

export function DashboardOverview({
  userName,
  stats,
}: {
  userName?: string | null;
  stats: DashboardStatsDTO;
}) {
  const muscleGroupCount = new Map(stats.muscleGroups.map((m) => [m.group, m.count]));
  const { unitLabel, toDisplay } = useUnit();

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-8 shadow-sm sm:px-8">
        <WolfMark
          showDetail={false}
          className="pointer-events-none absolute -top-8 -right-8 size-48 text-brand/6 dark:text-brand/12"
        />
        <div className="relative">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Bienvenue
            {userName && (
              <>
                {", "}
                <span className="bg-(image:--brand-gradient) bg-clip-text text-transparent">
                  {userName}
                </span>
              </>
            )}{" "}
            👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            Voici un aperçu de ton entraînement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WidgetCard title="Séance du jour" icon={Dumbbell} color="bg-brand/12 text-brand" index={0} className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">
            Aucun programme actif pour aujourd&apos;hui.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" render={<Link href="/programs" />} nativeButton={false}>
              Voir mes programmes
            </Button>
            <StartSessionButton size="sm" variant="outline">
              Séance libre
            </StartSessionButton>
          </div>
        </WidgetCard>

        <WidgetCard title="Série en cours" icon={Flame} color="bg-muscle-chest/12 text-muscle-chest" index={1}>
          <p className="font-heading text-3xl font-semibold">{stats.streak}</p>
          <p className="text-xs text-muted-foreground">
            jour{stats.streak > 1 ? "s" : ""} consécutif{stats.streak > 1 ? "s" : ""}
          </p>
        </WidgetCard>

        <WidgetCard title="Séances totales" icon={CalendarCheck} color="bg-muscle-back/12 text-muscle-back" index={2}>
          <p className="font-heading text-3xl font-semibold">{stats.totalSessions}</p>
          <p className="text-xs text-muted-foreground">depuis le début</p>
        </WidgetCard>

        <WidgetCard title="Volume cette semaine" icon={Activity} color="bg-muscle-quadriceps/12 text-muscle-quadriceps" index={3}>
          <p className="font-heading text-3xl font-semibold">
            {toDisplay(stats.volumeThisWeek)} {unitLabel}
          </p>
          <p className="text-xs text-muted-foreground">tonnage soulevé</p>
        </WidgetCard>

        <WidgetCard title="Volume ce mois-ci" icon={TrendingUp} color="bg-muscle-glutes/12 text-muscle-glutes" index={4}>
          <p className="font-heading text-3xl font-semibold">
            {toDisplay(stats.volumeThisMonth)} {unitLabel}
          </p>
          <p className="text-xs text-muted-foreground">tonnage soulevé</p>
        </WidgetCard>

        <WidgetCard title="Poids actuel" icon={Weight} color="bg-muscle-calves/12 text-muscle-calves" index={5}>
          <p className="font-heading text-3xl font-semibold">
            {stats.latestBodyWeight != null ? `${toDisplay(stats.latestBodyWeight)} ${unitLabel}` : "—"}
          </p>
          <Button
            size="sm"
            variant="link"
            className="h-auto px-0 text-xs"
            render={<Link href="/bodyweight" />}
            nativeButton={false}
          >
            Enregistrer mon poids
          </Button>
        </WidgetCard>

        <WidgetCard
          title="Records récents"
          icon={Trophy}
          color="bg-muscle-forearms/12 text-muscle-forearms"
          index={6}
          className="lg:col-span-2"
        >
          {stats.recentPRs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun record pour l&apos;instant. Termine une séance pour voir tes
              premiers PRs ici.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {stats.recentPRs.map((pr, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate">{pr.exerciseName}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {toDisplay(pr.weight)} {unitLabel} × {pr.reps}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard
          title="Groupes musculaires (7 jours)"
          icon={Dumbbell}
          color="bg-muscle-triceps/12 text-muscle-triceps"
          index={7}
          className="lg:col-span-2"
        >
          <div className="flex flex-wrap gap-2">
            {muscleGroupOrder.map((group) => (
              <span
                key={group}
                className={`rounded-full px-3 py-1 text-xs font-medium ${muscleGroupColorClasses[group]}`}
              >
                {muscleGroupLabels[group]} · {muscleGroupCount.get(group) ?? 0}
              </span>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard
          title="Constance d'entraînement"
          icon={HeartPulse}
          color="bg-muscle-hamstrings/12 text-muscle-hamstrings"
          index={8}
          className="lg:col-span-2"
        >
          <div className="space-y-2">
            <Progress value={stats.consistency} />
            <p className="text-xs text-muted-foreground">
              {stats.consistency}% de ton objectif indicatif (~3 séances/semaine),{" "}
              {stats.sessionsThisMonth} séance{stats.sessionsThisMonth > 1 ? "s" : ""} ce mois-ci
            </p>
          </div>
        </WidgetCard>

        <WidgetCard
          title="Activité récente"
          icon={Activity}
          color="bg-muscle-shoulders/12 text-muscle-shoulders"
          index={9}
          className="lg:col-span-2"
        >
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ton activité (séances, records, poids) apparaîtra ici.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {stats.recentActivity.map((activity) => (
                <li key={activity.id} className="text-sm">
                  <Link
                    href={`/workout/${activity.id}`}
                    className="flex items-center justify-between gap-2 rounded-md -mx-1.5 px-1.5 py-0.5 transition-colors hover:bg-accent/60"
                  >
                    <span className="truncate">{activity.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeDate(activity.date)} · {toDisplay(activity.volume)} {unitLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard title="Insight" icon={Sparkles} color="bg-brand/12 text-brand" index={10} className="lg:col-span-4">
          {stats.insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Crée un programme et enregistre ta première séance : cette carte
              affichera ensuite des analyses personnalisées (progression,
              plateaux, muscles délaissés...).
            </p>
          ) : (
            <ul className="space-y-1.5">
              {stats.insights.map((insight) => (
                <li key={insight} className="text-sm text-muted-foreground">
                  {insight}
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>
    </div>
  );
}
