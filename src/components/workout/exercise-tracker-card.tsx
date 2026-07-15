"use client";

import { useState } from "react";
import { MoreVertical, Repeat, EyeOff, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";

import type { SessionExerciseDTO, WorkoutSetDTO } from "@/types/workout";
import { muscleGroupLabels } from "@/lib/constants";
import { useUnit } from "@/hooks/use-unit";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SetRow } from "@/components/workout/set-row";
import { ExerciseActionDialog } from "@/components/workout/exercise-action-dialog";

type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: keyof typeof muscleGroupLabels;
  equipment: string | null;
};

export function ExerciseTrackerCard({
  sessionId,
  sessionExercise,
  exercises,
  onChanged,
  onSetCompleted,
}: {
  sessionId: string;
  sessionExercise: SessionExerciseDTO;
  exercises: ExerciseOption[];
  onChanged: (sessionExercise: SessionExerciseDTO) => void;
  onSetCompleted: (restSeconds: number | null) => void;
}) {
  const [actionDialog, setActionDialog] = useState<"swap" | "skip" | null>(null);
  const isSkipped = sessionExercise.action === "SKIPPED";
  const { unitLabel, toDisplay } = useUnit();
  const targetWeight = sessionExercise.targetWeight ? toDisplay(Number(sessionExercise.targetWeight)) : null;

  function updateSets(sets: WorkoutSetDTO[]) {
    onChanged({ ...sessionExercise, sets });
  }

  async function handleAddSet() {
    const response = await fetch(
      `/api/workouts/sessions/${sessionId}/exercises/${sessionExercise.id}/sets`,
      { method: "POST" }
    );
    if (!response.ok) {
      toast.error("Impossible d'ajouter une série.");
      return;
    }
    const data = await response.json();
    updateSets([...sessionExercise.sets, data.set]);
  }

  async function handleRestore() {
    const response = await fetch(
      `/api/workouts/sessions/${sessionId}/exercises/${sessionExercise.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "restore" }),
      }
    );
    if (!response.ok) {
      toast.error("Impossible de restaurer l'exercice.");
      return;
    }
    const data = await response.json();
    onChanged(data.sessionExercise);
  }

  return (
    <Card
      className={isSkipped ? "opacity-60" : undefined}
      style={{
        borderLeftColor: `var(--muscle-${sessionExercise.exercise.muscleGroup.toLowerCase()})`,
        borderLeftWidth: 3,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-heading font-medium">{sessionExercise.exercise.name}</h2>
            {isSkipped && (
              <Badge variant="outline" className="shrink-0 text-xs">
                Ignoré
              </Badge>
            )}
            {sessionExercise.action === "ADDED" && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Ajouté
              </Badge>
            )}
            {sessionExercise.action === "SWAPPED" && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Remplacé
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {sessionExercise.targetSets} × {sessionExercise.targetRepsMin}-
            {sessionExercise.targetRepsMax} reps
            {targetWeight ? ` · ${targetWeight} ${unitLabel}` : ""}
          </p>
        </div>

        {isSkipped ? (
          <Button size="sm" variant="outline" onClick={handleRestore}>
            <RotateCcw className="size-4" />
            Restaurer
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}>
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActionDialog("swap")}>
                <Repeat className="size-4" />
                Remplacer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionDialog("skip")}>
                <EyeOff className="size-4" />
                Ignorer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      {!isSkipped && (
        <CardContent className="space-y-2">
          {sessionExercise.sets.map((set) => (
            <SetRow
              key={set.id}
              sessionId={sessionId}
              set={set}
              onUpdated={(updated) =>
                updateSets(sessionExercise.sets.map((s) => (s.id === updated.id ? updated : s)))
              }
              onRemoved={(id) => updateSets(sessionExercise.sets.filter((s) => s.id !== id))}
              onCompleted={() => onSetCompleted(sessionExercise.restSeconds)}
            />
          ))}
          <Button size="sm" variant="ghost" onClick={handleAddSet}>
            <Plus className="size-4" />
            Ajouter une série
          </Button>
        </CardContent>
      )}

      {actionDialog && (
        <ExerciseActionDialog
          mode={actionDialog}
          open={Boolean(actionDialog)}
          onOpenChange={(open) => !open && setActionDialog(null)}
          sessionId={sessionId}
          sessionExercise={sessionExercise}
          exercises={exercises}
          onDone={onChanged}
        />
      )}
    </Card>
  );
}
