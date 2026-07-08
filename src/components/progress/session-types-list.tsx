"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export type SessionType = {
  dayName: string | null;
  sessionsCount: number;
  lastTrainedAt: string;
  lastSessionId: string;
};

function formatRelativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

export function SessionTypesList({ sessionTypes }: { sessionTypes: SessionType[] }) {
  return (
    <div className="space-y-2">
      {sessionTypes.map((type, index) => (
        <motion.div
          key={type.dayName ?? "__free__"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.02 }}
        >
          <Card className="transition-shadow duration-200 hover:shadow-sm">
            <CardContent>
              <Link
                href={`/progress/workout/${type.lastSessionId}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <CalendarDays className="size-4" />
                  </span>
                  <p className="truncate font-medium">{type.dayName ?? "Séance libre"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {type.sessionsCount} séance{type.sessionsCount > 1 ? "s" : ""} · dernière fois{" "}
                    {formatRelativeDate(type.lastTrainedAt)}
                  </span>
                  <ChevronRight className="size-4" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
