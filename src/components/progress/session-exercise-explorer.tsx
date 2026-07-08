"use client";

import { useState, type ReactNode } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { muscleGroupLabels, type MuscleGroupValue } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExerciseProgressStats } from "@/components/progress/exercise-progress-stats";

type SeriesPoint = {
  date: string;
  best1RM: number;
  volume: number;
  bestWeight: number;
  avgReps: number;
  setCount: number;
};

export type SessionExerciseHistory = {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroupValue;
  metrics: {
    bestWeight: number;
    best1RM: number;
    totalVolume: number;
    avgReps: number;
    avgWeight: number;
    progressionPercent: number | null;
  } | null;
  series: SeriesPoint[];
  insights: string[];
};

function ExerciseDetail({
  exercise,
  compact,
}: {
  exercise: SessionExerciseHistory;
  compact: boolean;
}) {
  if (!exercise.metrics) return null;
  const color = `var(--muscle-${exercise.muscleGroup.toLowerCase()})`;

  return (
    <div className={compact ? "flex h-full min-h-0 flex-col gap-4" : "space-y-4"}>
      <Badge
        className="w-fit shrink-0 border-transparent"
        style={{
          backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`,
          color,
        }}
      >
        {muscleGroupLabels[exercise.muscleGroup]}
      </Badge>
      {compact ? (
        <div className="min-h-0 flex-1">
          <ExerciseProgressStats
            metrics={exercise.metrics}
            series={exercise.series}
            insights={exercise.insights}
            color={color}
            compact
          />
        </div>
      ) : (
        <ExerciseProgressStats
          metrics={exercise.metrics}
          series={exercise.series}
          insights={exercise.insights}
          color={color}
        />
      )}
    </div>
  );
}

export function SessionExerciseExplorer({
  header,
  exercises,
}: {
  header: ReactNode;
  exercises: SessionExerciseHistory[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (exercises.length === 0) return null;
  const selected = exercises[selectedIndex];

  function go(delta: number) {
    setSelectedIndex((i) => Math.min(Math.max(i + delta, 0), exercises.length - 1));
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 60;
    if (info.offset.x < -threshold) go(1);
    else if (info.offset.x > threshold) go(-1);
  }

  return (
    <>
      {/* Desktop : titre + liste d'exercices en colonne à gauche, stats/graphique
          à droite, sans scroll de page. */}
      <div className="hidden min-h-0 flex-1 gap-6 md:flex">
        <div className="flex w-56 shrink-0 flex-col gap-4">
          {header}
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {exercises.map((exercise, index) => {
              const color = `var(--muscle-${exercise.muscleGroup.toLowerCase()})`;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={exercise.exerciseId}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "block w-full truncate rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  style={isSelected ? { boxShadow: `inset 3px 0 0 ${color}` } : undefined}
                >
                  {exercise.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ExerciseDetail exercise={selected} compact />
        </div>
      </div>

      {/* Mobile : un exercice à la fois, swipeable. */}
      <div className="md:hidden">
        {header}

        <div className="mt-4 mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Exercice précédent"
            onClick={() => go(-1)}
            disabled={selectedIndex === 0}
            className="flex size-8 items-center justify-center rounded-full border text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-medium">{selected.name}</p>
            <div className="mt-1 flex justify-center gap-1.5">
              {exercises.map((exercise, index) => (
                <span
                  key={exercise.exerciseId}
                  className={cn(
                    "size-1.5 rounded-full",
                    index === selectedIndex ? "bg-foreground" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            aria-label="Exercice suivant"
            onClick={() => go(1)}
            disabled={selectedIndex === exercises.length - 1}
            className="flex size-8 items-center justify-center rounded-full border text-muted-foreground disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: `${-selectedIndex * 100}%` }}
            transition={{ type: "tween", duration: 0.25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
          >
            {exercises.map((exercise) => (
              <div key={exercise.exerciseId} className="w-full shrink-0 px-0.5">
                <ExerciseDetail exercise={exercise} compact={false} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
