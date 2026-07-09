"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DashboardActivitySession } from "@/types/dashboard";

const weekdayLetters = ["D", "L", "M", "M", "J", "V", "S"];

function formatFullDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function DayPopover({ date, sessions }: { date: string; sessions: DashboardActivitySession[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-heading text-sm font-semibold capitalize">{formatFullDate(date)}</p>
      {sessions.map((session) => (
        <Link
          key={session.sessionId}
          href={`/progress/workout/${session.sessionId}`}
          className="block rounded-lg border bg-muted/40 p-3 transition-colors hover:bg-muted"
        >
          <p className="truncate font-medium">{session.dayName ?? "Séance libre"}</p>
          {session.exercises.length > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {session.exercises.join(", ")} · {session.totalSets} série
              {session.totalSets > 1 ? "s" : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Aucune série complétée.</p>
          )}
        </Link>
      ))}
    </div>
  );
}

export function ActivityStrip({
  activity,
}: {
  activity: {
    date: string;
    weekday: number;
    trained: boolean;
    sessions: DashboardActivitySession[];
  }[];
}) {
  const trainedCount = activity.filter((day) => day.trained).length;
  const todayKey = activity[activity.length - 1]?.date;

  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {trainedCount}
        </span>
        <span className="text-sm text-muted-foreground">
          séance{trainedCount > 1 ? "s" : ""} sur les 14 derniers jours
        </span>
      </div>

      <div
        role="img"
        aria-label={`${trainedCount} jour${trainedCount > 1 ? "s" : ""} entraîné${trainedCount > 1 ? "s" : ""} sur les 14 derniers`}
        className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:gap-3 md:grid md:grid-cols-7 md:flex-wrap md:overflow-visible"
      >
        {activity.map((day) =>
          day.trained ? (
            <Popover key={day.date}>
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <PopoverTrigger
                  openOnHover
                  delay={150}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl bg-(image:--brand-gradient) text-brand-foreground shadow-sm transition-transform hover:scale-105 sm:size-12 md:size-14",
                    day.date === todayKey && "ring-2 ring-brand ring-offset-2 ring-offset-card"
                  )}
                >
                  <Dumbbell className="size-4 sm:size-5" />
                </PopoverTrigger>
                <span className="text-xs text-muted-foreground">
                  {weekdayLetters[day.weekday]}
                </span>
              </div>
              <PopoverContent side="top">
                <DayPopover date={day.date} sessions={day.sessions} />
              </PopoverContent>
            </Popover>
          ) : (
            <div key={day.date} className="flex shrink-0 flex-col items-center gap-1.5">
              <div
                title={formatFullDate(day.date)}
                className={cn(
                  "size-10 rounded-xl border border-dashed border-border/60 sm:size-12 md:size-14",
                  day.date === todayKey && "ring-2 ring-brand ring-offset-2 ring-offset-card"
                )}
              />
              <span className="text-xs text-muted-foreground">
                {weekdayLetters[day.weekday]}
              </span>
            </div>
          )
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex size-4 items-center justify-center rounded-md bg-(image:--brand-gradient)">
            <Dumbbell className="size-2.5 text-brand-foreground" />
          </span>
          Entraîné
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-4 rounded-md border border-dashed border-border/60" />
          Repos
        </span>
      </div>
    </div>
  );
}
