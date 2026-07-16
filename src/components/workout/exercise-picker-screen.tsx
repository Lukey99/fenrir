"use client";

import { useState } from "react";
import { MoreVertical, Repeat, EyeOff, RotateCcw, CheckCircle2, Repeat2 } from "lucide-react";
import { toast } from "sonner";

import type { SessionExerciseDTO, WorkoutSessionDTO } from "@/types/workout";
import { muscleGroupLabels } from "@/lib/constants";
import { groupBySupersetGroup } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddSessionExerciseDialog } from "@/components/workout/add-session-exercise-dialog";
import { ExerciseActionDialog } from "@/components/workout/exercise-action-dialog";
import type { ExercisePickerOption } from "@/components/exercises/exercise-picker";

function ExerciseRow({
  sessionId,
  exercise,
  exercises,
  onSelect,
  onUpdated,
}: {
  sessionId: string;
  exercise: SessionExerciseDTO;
  exercises: ExercisePickerOption[];
  onSelect: () => void;
  onUpdated: (updated: SessionExerciseDTO) => void;
}) {
  const [actionDialog, setActionDialog] = useState<"swap" | "skip" | null>(null);
  const isSkipped = exercise.action === "SKIPPED";
  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const totalSets = Math.max(exercise.targetSets, exercise.sets.length);
  const allDone = !isSkipped && exercise.sets.length > 0 && completedSets === exercise.sets.length;

  async function handleRestore() {
    const response = await fetch(`/api/workouts/sessions/${sessionId}/exercises/${exercise.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "restore" }),
    });
    if (!response.ok) {
      toast.error("Impossible de restaurer l'exercice.");
      return;
    }
    const data = await response.json();
    onUpdated(data.sessionExercise);
  }

  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
      style={{
        borderLeftColor: `var(--muscle-${exercise.exercise.muscleGroup.toLowerCase()})`,
        borderLeftWidth: 3,
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={isSkipped}
        className="min-w-0 flex-1 text-left disabled:cursor-default"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate font-medium">{exercise.exercise.name}</p>
          {isSkipped && (
            <Badge variant="outline" className="shrink-0 text-xs">
              Ignoré
            </Badge>
          )}
          {exercise.action === "ADDED" && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Ajouté
            </Badge>
          )}
          {exercise.action === "SWAPPED" && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Remplacé
            </Badge>
          )}
          {allDone && (
            <Badge className="shrink-0 gap-1 bg-brand/12 text-xs text-brand-ink">
              <CheckCircle2 className="size-3" />
              Terminé
            </Badge>
          )}
          {exercise.supersetGroup != null && (
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
              <Repeat2 className="size-3" />
              Superset
            </Badge>
          )}
        </div>
        {!isSkipped && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {muscleGroupLabels[exercise.exercise.muscleGroup]} · {completedSets}/{totalSets} séries
          </p>
        )}
      </button>

      {isSkipped ? (
        <Button variant="outline" size="sm" onClick={handleRestore}>
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

      {actionDialog && (
        <ExerciseActionDialog
          mode={actionDialog}
          open={Boolean(actionDialog)}
          onOpenChange={(open) => !open && setActionDialog(null)}
          sessionId={sessionId}
          sessionExercise={exercise}
          exercises={exercises}
          onDone={onUpdated}
        />
      )}
    </div>
  );
}

export function ExercisePickerScreen({
  session,
  exercises,
  onSelectExercise,
  onExerciseUpdated,
  onExerciseAdded,
  onTerminate,
}: {
  session: WorkoutSessionDTO;
  exercises: ExercisePickerOption[];
  onSelectExercise: (sessionExerciseId: string) => void;
  onExerciseUpdated: (updated: SessionExerciseDTO) => void;
  onExerciseAdded: (added: SessionExerciseDTO) => void;
  onTerminate: () => void;
}) {
  const activeExercises = session.exercises.filter((e) => e.action !== "SKIPPED");
  const allSessionDone =
    activeExercises.length > 0 &&
    activeExercises.every((e) => e.sets.length > 0 && e.sets.every((s) => s.completed));

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto px-4 py-4">
      <div className="mb-4">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {session.programDay ? session.programDay.name : "Séance libre"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Choisis l&apos;exercice à faire.</p>
      </div>

      {allSessionDone && (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand-ink">
          Bravo, tout est terminé — tu peux clôturer la séance.
        </div>
      )}

      <div className="flex-1 space-y-2">
        {groupBySupersetGroup(session.exercises).map((item) => {
          const items = Array.isArray(item) ? item : [item];
          const isGroup = items.length > 1;
          const rows = items.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              sessionId={session.id}
              exercise={exercise}
              exercises={exercises}
              onSelect={() => onSelectExercise(exercise.id)}
              onUpdated={onExerciseUpdated}
            />
          ));
          return isGroup ? (
            <div key={`group-${items[0].supersetGroup}`} className="space-y-2 rounded-xl border border-dashed p-2">
              {rows}
            </div>
          ) : (
            rows[0]
          );
        })}

        {session.exercises.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            Aucun exercice pour l&apos;instant. Ajoutes-en un pour commencer.
          </div>
        )}

        <AddSessionExerciseDialog
          sessionId={session.id}
          hasProgram={Boolean(session.programDayId)}
          exercises={exercises}
          onAdded={onExerciseAdded}
        />
      </div>

      <div className="mt-6">
        <Button size="lg" className="w-full" onClick={onTerminate}>
          Terminer la séance
        </Button>
      </div>
    </div>
  );
}
