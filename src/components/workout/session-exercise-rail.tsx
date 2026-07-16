"use client";

import type { WorkoutSessionDTO } from "@/types/workout";
import { cn } from "@/lib/utils";

/** Desktop-only (`md:`+) persistent panel mirroring the picker's progress —
 * lets desktop users jump straight into another exercise without leaving the
 * logging/resting screens, the same escape hatch mobile gets via
 * "Retour à la liste" (useful for alternating supersets set-by-set). */
export function SessionExerciseRail({
  session,
  activeSessionExerciseId,
  onSelectExercise,
}: {
  session: WorkoutSessionDTO;
  activeSessionExerciseId: string | null;
  onSelectExercise: (sessionExerciseId: string) => void;
}) {
  const activeExercises = session.exercises.filter((e) => e.action !== "SKIPPED");

  return (
    <div className="hidden w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r p-3 md:flex">
      <p className="px-2 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Exercices
      </p>
      {activeExercises.map((exercise) => {
        const completed = exercise.sets.filter((s) => s.completed).length;
        const total = Math.max(exercise.targetSets, exercise.sets.length);
        const isActive = exercise.id === activeSessionExerciseId;

        return (
          <button
            key={exercise.id}
            type="button"
            onClick={() => onSelectExercise(exercise.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-left text-sm transition-colors",
              isActive ? "bg-brand/10 text-brand-ink" : "hover:bg-accent"
            )}
          >
            <p className="truncate font-medium">{exercise.exercise.name}</p>
            <p className={cn("text-xs", isActive ? "text-brand-ink" : "text-muted-foreground")}>
              {completed}/{total} séries
            </p>
          </button>
        );
      })}
    </div>
  );
}
