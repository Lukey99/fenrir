"use client";

import { cn } from "@/lib/utils";

const weekdayLetters = ["D", "L", "M", "M", "J", "V", "S"];

export function WeeklyVolumeChart({
  weeklyVolume,
}: {
  weeklyVolume: { weekday: number; volumeKg: number }[];
}) {
  const todayWeekday = new Date().getDay();
  const max = Math.max(...weeklyVolume.map((d) => d.volumeKg), 1);
  const totalVolume = weeklyVolume.reduce((sum, d) => sum + d.volumeKg, 0);

  return (
    <div
      role="img"
      aria-label={`Volume soulevé cette semaine : ${totalVolume.toLocaleString("fr-FR")} kg au total`}
      className="flex h-44 items-end justify-between gap-2 sm:gap-4"
    >
      {weeklyVolume.map((day) => {
        const isToday = day.weekday === todayWeekday;
        const heightPercent = day.volumeKg > 0 ? Math.max(8, (day.volumeKg / max) * 100) : 0;

        return (
          <div key={day.weekday} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-32 w-full items-end justify-center">
              {isToday && day.volumeKg > 0 && (
                <span className="absolute -top-7 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-background">
                  {day.volumeKg.toLocaleString("fr-FR")} kg
                </span>
              )}
              <div
                title={`${day.volumeKg.toLocaleString("fr-FR")} kg`}
                style={{ height: day.volumeKg > 0 ? `${heightPercent}%` : "0.5rem" }}
                className={cn(
                  "w-full max-w-8 rounded-full transition-[height] duration-500",
                  day.volumeKg === 0
                    ? "border border-dashed border-border/60"
                    : isToday
                      ? "bg-(image:--brand-gradient)"
                      : "bg-muted"
                )}
              />
            </div>
            <span className={cn("text-xs", isToday ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {weekdayLetters[day.weekday]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
