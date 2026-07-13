"use client";

import { motion } from "framer-motion";
import { Flame, CalendarDays, Timer, Trophy, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { CountUp } from "@/components/ui/count-up";

const cardRounding = "rounded-2xl md:rounded-3xl";

type Stat = {
  label: string;
  value: number | null;
  suffix?: string;
  icon: LucideIcon;
  accent?: boolean;
  progress?: number;
};

export function StatCards({
  counts,
  weightGoal,
}: {
  counts: {
    totalSessions: number;
    sessionsThisWeek: number;
    inProgressSessions: number;
  };
  weightGoal: { targetWeight: number; remaining: number; progressPercent: number } | null;
}) {
  const stats: Stat[] = [
    { label: "Séances totales", value: counts.totalSessions, icon: Flame, accent: true },
    { label: "Cette semaine", value: counts.sessionsThisWeek, icon: CalendarDays },
    { label: "En cours", value: counts.inProgressSessions, icon: Timer },
    {
      label: "Objectif de poids",
      value: weightGoal ? weightGoal.progressPercent : null,
      suffix: "%",
      icon: Trophy,
      progress: weightGoal ? weightGoal.progressPercent : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04, ease: "easeOut" }}
          className={cn(
            "flex flex-col gap-2 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(0,0,0,0.6)]",
            cardRounding,
            stat.accent ? "bg-(image:--brand-gradient) text-brand-foreground" : "bg-card"
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-sm font-medium",
                stat.accent ? "text-brand-foreground/80" : "text-muted-foreground"
              )}
            >
              {stat.label}
            </span>
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                stat.accent ? "bg-white/20" : "bg-muted"
              )}
            >
              <stat.icon className="size-3" />
            </span>
          </div>
          {stat.value !== null ? (
            <CountUp value={stat.value} suffix={stat.suffix} className="font-heading text-xl font-bold" />
          ) : (
            <span className="font-heading text-xl font-bold text-muted-foreground">—</span>
          )}
          {stat.progress !== undefined && (
            <div
              role="progressbar"
              aria-valuenow={stat.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className={cn(
                "h-1.5 overflow-hidden rounded-full",
                stat.accent ? "bg-white/20" : "bg-muted"
              )}
            >
              <motion.div
                className={cn("h-full rounded-full", stat.accent ? "bg-white" : "bg-brand")}
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
