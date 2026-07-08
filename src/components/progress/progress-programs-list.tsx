"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export type ProgressProgram = {
  id: string;
  name: string;
  sessionsCount: number;
  exercisesCount: number;
  lastTrainedAt: string;
};

function formatRelativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

export function ProgressProgramsList({ programs }: { programs: ProgressProgram[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {programs.map((program, index) => (
        <motion.div
          key={program.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.03 }}
          whileHover={{ y: -3 }}
        >
          <Card
            className="h-full border-l-[3px] border-l-brand transition-shadow duration-300 hover:shadow-lg hover:shadow-foreground/5"
          >
            <CardContent>
              <Link href={`/progress/program/${program.id}`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Dumbbell className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{program.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(program.lastTrainedAt)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div>
                    <p className="font-heading text-lg font-semibold">{program.sessionsCount}</p>
                    <p className="text-xs text-muted-foreground">
                      séance{program.sessionsCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-semibold">{program.exercisesCount}</p>
                    <p className="text-xs text-muted-foreground">
                      exercice{program.exercisesCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
