"use client";

import { useState } from "react";
import { Repeat, EyeOff } from "lucide-react";
import { toast } from "sonner";

import type { SessionExerciseDTO } from "@/types/workout";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExercisePicker, type ExercisePickerOption } from "@/components/exercises/exercise-picker";

type ExerciseOption = ExercisePickerOption;

export function ExerciseActionDialog({
  mode,
  open,
  onOpenChange,
  sessionId,
  sessionExercise,
  exercises,
  onDone,
}: {
  mode: "swap" | "skip";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionExercise: SessionExerciseDTO;
  exercises: ExerciseOption[];
  onDone: (sessionExercise: SessionExerciseDTO) => void;
}) {
  const [selected, setSelected] = useState<ExerciseOption | null>(null);
  const [scope, setScope] = useState<"session" | "program">("session");
  const [busy, setBusy] = useState(false);

  const canScopeProgram = Boolean(sessionExercise.sourceProgramDayExerciseId);

  function reset() {
    setSelected(null);
    setScope("session");
  }

  async function handleConfirm() {
    setBusy(true);
    const body =
      mode === "swap"
        ? { type: "swap", exerciseId: selected?.id, scope }
        : { type: "skip", scope };

    const response = await fetch(
      `/api/workouts/sessions/${sessionId}/exercises/${sessionExercise.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      toast.error("Action impossible.");
      return;
    }

    toast.success(mode === "swap" ? "Exercice remplacé." : "Exercice ignoré.");
    onDone(data.sessionExercise);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "swap" ? "Remplacer l'exercice" : "Ignorer l'exercice"}
          </DialogTitle>
          <DialogDescription>
            {mode === "swap"
              ? `Choisis un remplaçant pour ${sessionExercise.exercise.name}.`
              : `${sessionExercise.exercise.name} ne sera pas comptabilisé dans cette séance.`}
          </DialogDescription>
        </DialogHeader>

        {mode === "swap" && !selected && (
          <ExercisePicker exercises={exercises} onSelect={setSelected} />
        )}

        {(mode === "skip" || selected) && (
          <div className="space-y-4">
            {selected && (
              <p className="text-sm">
                Remplacer par <span className="font-medium">{selected.name}</span>
              </p>
            )}

            {canScopeProgram && (
              <div className="space-y-2">
                <Label>Portée</Label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setScope("session")}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                      scope === "session" ? "border-brand bg-brand/5" : "hover:bg-accent"
                    )}
                  >
                    <span className="mt-0.5 font-medium">Aujourd&apos;hui seulement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("program")}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                      scope === "program" ? "border-brand bg-brand/5" : "hover:bg-accent"
                    )}
                  >
                    <span className="mt-0.5 font-medium">
                      {mode === "swap"
                        ? "Mettre à jour le programme aussi"
                        : "Retirer aussi du programme"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            <DialogFooter>
              {selected && (
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Retour
                </Button>
              )}
              <Button onClick={handleConfirm} disabled={busy}>
                {mode === "swap" ? <Repeat className="size-4" /> : <EyeOff className="size-4" />}
                {busy ? "..." : "Confirmer"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
