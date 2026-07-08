"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

import { muscleGroupLabels, type MuscleGroupValue } from "@/lib/constants";
import { useUnit } from "@/hooks/use-unit";
import { Card, CardContent } from "@/components/ui/card";

export type TrainedExercise = {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroupValue;
  lastTrainedAt: string;
  sessionsCount: number;
  best1RM: number;
};

function formatRelativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

export function ProgressExercisesList({ exercises }: { exercises: TrainedExercise[] }) {
  const { unitLabel, toDisplay } = useUnit();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise, index) => (
        <motion.div
          key={exercise.exerciseId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.03 }}
          whileHover={{ y: -3 }}
        >
          <Card
            className="h-full transition-shadow duration-300 hover:shadow-lg hover:shadow-foreground/5"
            style={{
              borderLeftColor: `var(--muscle-${exercise.muscleGroup.toLowerCase()})`,
              borderLeftWidth: 3,
            }}
          >
            <CardContent>
              <Link href={`/progress/${exercise.exerciseId}`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {muscleGroupLabels[exercise.muscleGroup]} · {formatRelativeDate(exercise.lastTrainedAt)}
                    </p>
                  </div>
                  <TrendingUp className="size-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div>
                    <p className="font-heading text-lg font-semibold">
                      {toDisplay(exercise.best1RM)} {unitLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">1RM estimé</p>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-semibold">{exercise.sessionsCount}</p>
                    <p className="text-xs text-muted-foreground">séances</p>
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
