"use client";

import { Link2Off, Repeat } from "lucide-react";
import { toast } from "sonner";

import type { ProgramDayExerciseDTO } from "@/types/program";
import { Button } from "@/components/ui/button";
import { ExerciseRow } from "@/components/programs/exercise-row";

export function SupersetGroup({
  programId,
  dayId,
  exercises,
  isFirst,
  isLast,
  onUpdated,
  onRemoved,
  onMove,
  onUngrouped,
}: {
  programId: string;
  dayId: string;
  exercises: ProgramDayExerciseDTO[];
  isFirst: boolean;
  isLast: boolean;
  onUpdated: (dayExercise: ProgramDayExerciseDTO) => void;
  onRemoved: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onUngrouped: (ids: string[]) => void;
}) {
  async function handleUngroup() {
    const results = await Promise.all(
      exercises.map((ex) =>
        fetch(`/api/programs/${programId}/days/${dayId}/exercises/${ex.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supersetGroup: null }),
        })
      )
    );
    if (results.some((r) => !r.ok)) {
      toast.error("Impossible de dissocier le superset.");
      return;
    }
    onUngrouped(exercises.map((ex) => ex.id));
    toast.success("Superset dissocié.");
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-brand/30 p-2">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-ink">
          <Repeat className="size-3.5" />
          Superset — {exercises.length} exercices enchaînés
        </span>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={handleUngroup}>
          <Link2Off className="size-3" />
          Dissocier
        </Button>
      </div>
      <div className="space-y-2">
        {exercises.map((dayExercise, index) => (
          <ExerciseRow
            key={dayExercise.id}
            programId={programId}
            dayId={dayId}
            dayExercise={dayExercise}
            isFirst={isFirst && index === 0}
            isLast={isLast && index === exercises.length - 1}
            onUpdated={onUpdated}
            onRemoved={onRemoved}
            onMove={onMove}
          />
        ))}
      </div>
    </div>
  );
}
