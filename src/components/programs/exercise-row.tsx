"use client";

import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ProgramDayExerciseDTO } from "@/types/program";
import { Button } from "@/components/ui/button";
import { EditExerciseDialog } from "@/components/programs/edit-exercise-dialog";
import { useUnit } from "@/hooks/use-unit";

export function ExerciseRow({
  programId,
  dayId,
  dayExercise,
  isFirst,
  isLast,
  onUpdated,
  onRemoved,
  onMove,
}: {
  programId: string;
  dayId: string;
  dayExercise: ProgramDayExerciseDTO;
  isFirst: boolean;
  isLast: boolean;
  onUpdated: (dayExercise: ProgramDayExerciseDTO) => void;
  onRemoved: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  async function handleRemove() {
    const response = await fetch(
      `/api/programs/${programId}/days/${dayId}/exercises/${dayExercise.id}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      toast.error("Impossible de retirer l'exercice.");
      return;
    }
    onRemoved(dayExercise.id);
  }

  const { unitLabel, toDisplay } = useUnit();
  const weight = dayExercise.targetWeight ? toDisplay(Number(dayExercise.targetWeight)) : null;

  return (
    <div
      className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"
      style={{ borderLeftColor: `var(--muscle-${dayExercise.exercise.muscleGroup.toLowerCase()})`, borderLeftWidth: 3 }}
    >
      <div className="flex flex-col">
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={isFirst}
          onClick={() => onMove(dayExercise.id, "up")}
          aria-label="Monter"
        >
          <ArrowUp className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={isLast}
          onClick={() => onMove(dayExercise.id, "down")}
          aria-label="Descendre"
        >
          <ArrowDown className="size-3" />
        </Button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{dayExercise.exercise.name}</p>
        <p className="text-xs text-muted-foreground">
          {dayExercise.targetSets} × {dayExercise.targetRepsMin}-{dayExercise.targetRepsMax} reps
          {weight ? ` · ${weight} ${unitLabel}` : ""}
          {dayExercise.restSeconds ? ` · ${dayExercise.restSeconds}s repos` : ""}
        </p>
        {dayExercise.notes && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground italic">
            {dayExercise.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <EditExerciseDialog
          programId={programId}
          dayId={dayId}
          dayExercise={dayExercise}
          onUpdated={onUpdated}
        />
        <Button variant="ghost" size="icon-sm" aria-label="Retirer" onClick={handleRemove}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
