"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronLeft } from "lucide-react";

import {
  addSessionExerciseSchema,
  type AddSessionExerciseInput,
} from "@/server/validators/workout";
import type { SessionExerciseDTO } from "@/types/workout";
import { optionalNumber } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExercisePicker, type ExercisePickerOption } from "@/components/exercises/exercise-picker";

type ExerciseOption = ExercisePickerOption;

export function AddSessionExerciseDialog({
  sessionId,
  hasProgram,
  exercises,
  onAdded,
}: {
  sessionId: string;
  hasProgram: boolean;
  exercises: ExerciseOption[];
  onAdded: (sessionExercise: SessionExerciseDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExerciseOption | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddSessionExerciseInput>({
    resolver: zodResolver(addSessionExerciseSchema),
    defaultValues: { targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, scope: "session" },
  });

  function selectExercise(exercise: ExerciseOption) {
    setSelected(exercise);
    setValue("exerciseId", exercise.id, { shouldValidate: true });
  }

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setSelected(null);
      setServerError(null);
      reset();
    }
  }

  async function onSubmit(values: AddSessionExerciseInput) {
    if (!selected) return;
    setServerError(null);

    const response = await fetch(`/api/workouts/sessions/${sessionId}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, exerciseId: selected.id }),
    });

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    onAdded(data.sessionExercise);
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus className="size-4" />
        Ajouter un exercice
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un exercice</DialogTitle>
          <DialogDescription>
            {selected ? "Définis les séries et répétitions cibles." : "Choisis un exercice."}
          </DialogDescription>
        </DialogHeader>

        {!selected ? (
          <ExercisePicker exercises={exercises} onSelect={selectExercise} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" />
              {selected.name}
            </button>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="se-targetSets">Séries</Label>
                <Input id="se-targetSets" type="number" {...register("targetSets", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="se-targetRepsMin">Reps min</Label>
                <Input
                  id="se-targetRepsMin"
                  type="number"
                  {...register("targetRepsMin", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="se-targetRepsMax">Reps max</Label>
                <Input
                  id="se-targetRepsMax"
                  type="number"
                  {...register("targetRepsMax", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="se-restSeconds">Repos (secondes, optionnel)</Label>
              <Input
                id="se-restSeconds"
                type="number"
                placeholder="Ex : 90"
                {...register("restSeconds", { setValueAs: optionalNumber })}
              />
              {errors.restSeconds && (
                <p className="text-sm text-destructive">{errors.restSeconds.message}</p>
              )}
            </div>

            {hasProgram && (
              <div className="space-y-2">
                <Label htmlFor="se-scope">Portée</Label>
                <select
                  id="se-scope"
                  {...register("scope")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="session">Aujourd&apos;hui seulement</option>
                  <option value="program">Ajouter aussi au programme</option>
                </select>
              </div>
            )}

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <DialogFooter>
              <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
