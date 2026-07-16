"use client";

import { useState } from "react";
import { ChevronLeft, Check, Plus } from "lucide-react";
import { toast } from "sonner";

import type { SessionExerciseDTO, WorkoutSetDTO } from "@/types/workout";
import { useUnit } from "@/hooks/use-unit";
import { decimalNumber } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NewRecordEvent = { exerciseName: string; weight: number; reps: number };

function SetLoggingForm({
  sessionId,
  sessionExercise,
  set,
  targetLabel,
  onValidated,
}: {
  sessionId: string;
  sessionExercise: SessionExerciseDTO;
  set: WorkoutSetDTO;
  targetLabel: string;
  onValidated: (updated: WorkoutSetDTO, newRecord: NewRecordEvent | null) => void;
}) {
  const { unitLabel, toDisplay, fromDisplay } = useUnit();
  const [weight, setWeight] = useState(set.weight ? String(toDisplay(Number(set.weight))) : "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [rpe, setRpe] = useState(set.rpe ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleValidate() {
    setSubmitting(true);
    const response = await fetch(`/api/workouts/sessions/${sessionId}/sets/${set.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: true,
        weight: weight === "" ? null : fromDisplay(decimalNumber(weight)),
        reps: reps === "" ? null : Number(reps),
        rpe: rpe === "" ? null : decimalNumber(String(rpe)),
      }),
    });
    setSubmitting(false);
    if (!response.ok) {
      toast.error("Impossible d'enregistrer la série.");
      return;
    }
    const data = await response.json();
    onValidated(data.set, data.newRecord ?? null);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-8 text-center">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {sessionExercise.exercise.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Série {set.setNumber} / {Math.max(sessionExercise.targetSets, sessionExercise.sets.length)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{targetLabel}</p>
      </div>

      <div className="grid w-full max-w-xs grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="log-weight">Poids ({unitLabel})</Label>
          <Input
            id="log-weight"
            inputMode="decimal"
            className="h-14 text-center text-lg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="log-reps">Reps</Label>
          <Input
            id="log-reps"
            inputMode="numeric"
            className="h-14 text-center text-lg"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Label htmlFor="log-rpe">RPE (optionnel)</Label>
        <Input
          id="log-rpe"
          inputMode="decimal"
          className="h-10 text-center"
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
        />
      </div>

      <Button size="lg" className="w-full max-w-xs" onClick={handleValidate} disabled={submitting}>
        <Check className="size-4" />
        {submitting ? "Enregistrement..." : "Valider la série"}
      </Button>
    </div>
  );
}

export function SetLoggingScreen({
  sessionId,
  sessionExercise,
  onValidated,
  onSetAdded,
  onBackToList,
}: {
  sessionId: string;
  sessionExercise: SessionExerciseDTO;
  onValidated: (updated: WorkoutSetDTO, newRecord: NewRecordEvent | null) => void;
  onSetAdded: (set: WorkoutSetDTO) => void;
  onBackToList: () => void;
}) {
  const { unitLabel, toDisplay } = useUnit();
  const [addingSet, setAddingSet] = useState(false);
  const currentSet = sessionExercise.sets.find((s) => !s.completed);

  const targetWeight = sessionExercise.targetWeight
    ? toDisplay(Number(sessionExercise.targetWeight))
    : null;
  const targetLabel = `Cible : ${sessionExercise.targetRepsMin}-${sessionExercise.targetRepsMax} reps${
    targetWeight ? ` · ${targetWeight} ${unitLabel}` : ""
  }`;

  async function handleAddSet() {
    setAddingSet(true);
    const response = await fetch(
      `/api/workouts/sessions/${sessionId}/exercises/${sessionExercise.id}/sets`,
      { method: "POST" }
    );
    setAddingSet(false);
    if (!response.ok) {
      toast.error("Impossible d'ajouter une série.");
      return;
    }
    const data = await response.json();
    onSetAdded(data.set);
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="px-4 pt-4">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={onBackToList}>
          <ChevronLeft className="size-4" />
          Retour à la liste
        </Button>
      </div>

      {currentSet ? (
        <SetLoggingForm
          key={currentSet.id}
          sessionId={sessionId}
          sessionExercise={sessionExercise}
          set={currentSet}
          targetLabel={targetLabel}
          onValidated={onValidated}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {sessionExercise.exercise.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Toutes les séries prévues sont terminées.
            </p>
          </div>
          <Button size="lg" onClick={handleAddSet} disabled={addingSet}>
            <Plus className="size-4" />
            {addingSet ? "Ajout..." : "Ajouter une série supplémentaire"}
          </Button>
        </div>
      )}
    </div>
  );
}
