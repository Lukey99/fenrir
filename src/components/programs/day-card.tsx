"use client";

import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ProgramDayDTO, ProgramDayExerciseDTO } from "@/types/program";
import { muscleGroupLabels } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DayFormDialog } from "@/components/programs/day-form-dialog";
import { AddExerciseDialog } from "@/components/programs/add-exercise-dialog";
import { ExerciseRow } from "@/components/programs/exercise-row";
import { StartSessionButton } from "@/components/workout/start-session-button";

type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: keyof typeof muscleGroupLabels;
  equipment: string | null;
};

export function DayCard({
  programId,
  day,
  exercises,
  isFirst,
  isLast,
  onDayUpdated,
  onDayRemoved,
  onDayMove,
  onExercisesChange,
}: {
  programId: string;
  day: ProgramDayDTO;
  exercises: ExerciseOption[];
  isFirst: boolean;
  isLast: boolean;
  onDayUpdated: (day: ProgramDayDTO) => void;
  onDayRemoved: (id: string) => void;
  onDayMove: (id: string, direction: "up" | "down") => void;
  onExercisesChange: (dayId: string, exercises: ProgramDayExerciseDTO[]) => void;
}) {
  async function handleRemoveDay() {
    const response = await fetch(`/api/programs/${programId}/days/${day.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Impossible de supprimer ce jour.");
      return;
    }
    onDayRemoved(day.id);
  }

  function handleExerciseAdded(dayExercise: ProgramDayExerciseDTO) {
    onExercisesChange(day.id, [...day.exercises, dayExercise]);
  }

  function handleExerciseUpdated(dayExercise: ProgramDayExerciseDTO) {
    onExercisesChange(
      day.id,
      day.exercises.map((e) => (e.id === dayExercise.id ? dayExercise : e))
    );
  }

  function handleExerciseRemoved(id: string) {
    onExercisesChange(
      day.id,
      day.exercises.filter((e) => e.id !== id)
    );
  }

  async function handleExerciseMove(id: string, direction: "up" | "down") {
    const index = day.exercises.findIndex((e) => e.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= day.exercises.length) return;

    const current = day.exercises[index];
    const swap = day.exercises[swapIndex];

    const reordered = [...day.exercises];
    reordered[index] = swap;
    reordered[swapIndex] = current;
    onExercisesChange(day.id, reordered);

    await Promise.all([
      fetch(`/api/programs/${programId}/days/${day.id}/exercises/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: swapIndex }),
      }),
      fetch(`/api/programs/${programId}/days/${day.id}/exercises/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      }),
    ]);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={isFirst}
              onClick={() => onDayMove(day.id, "up")}
              aria-label="Monter le jour"
            >
              <ArrowUp className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={isLast}
              onClick={() => onDayMove(day.id, "down")}
              aria-label="Descendre le jour"
            >
              <ArrowDown className="size-3" />
            </Button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-medium">{day.name}</h3>
              {day.label && (
                <Badge variant="secondary" className="text-xs">
                  {day.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {day.exercises.length} exercice{day.exercises.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StartSessionButton programDayId={day.id} size="sm" variant="outline">
            Démarrer
          </StartSessionButton>
          <DayFormDialog mode="edit" programId={programId} day={day} onSaved={onDayUpdated} />
          <Button variant="ghost" size="icon-sm" aria-label="Supprimer le jour" onClick={handleRemoveDay}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {day.exercises.map((dayExercise, index) => (
          <ExerciseRow
            key={dayExercise.id}
            programId={programId}
            dayId={day.id}
            dayExercise={dayExercise}
            isFirst={index === 0}
            isLast={index === day.exercises.length - 1}
            onUpdated={handleExerciseUpdated}
            onRemoved={handleExerciseRemoved}
            onMove={handleExerciseMove}
          />
        ))}
        {day.exercises.length === 0 && (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            Aucun exercice pour ce jour.
          </p>
        )}
        <AddExerciseDialog
          programId={programId}
          dayId={day.id}
          exercises={exercises}
          onAdded={handleExerciseAdded}
        />
      </CardContent>
    </Card>
  );
}
