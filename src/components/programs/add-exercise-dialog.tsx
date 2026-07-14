"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import {
  createProgramDayExerciseSchema,
  type CreateProgramDayExerciseInput,
} from "@/server/validators/program";
import type { ProgramDayExerciseDTO } from "@/types/program";
import { cn, optionalNumber } from "@/lib/utils";
import { useUnit } from "@/hooks/use-unit";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ExercisePicker,
  type ExercisePickerOption,
} from "@/components/exercises/exercise-picker";

type ExerciseOption = ExercisePickerOption;

export function AddExerciseDialog({
  programId,
  dayId,
  exercises,
  onAdded,
}: {
  programId: string;
  dayId: string;
  exercises: ExerciseOption[];
  onAdded: (dayExercise: ProgramDayExerciseDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExerciseOption | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { unitLabel, fromDisplay } = useUnit();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProgramDayExerciseInput>({
    resolver: zodResolver(createProgramDayExerciseSchema),
    defaultValues: { targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
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

  async function onSubmit(values: CreateProgramDayExerciseInput) {
    if (!selected) return;
    setServerError(null);

    const response = await fetch(
      `/api/programs/${programId}/days/${dayId}/exercises`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, exerciseId: selected.id }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success(`${selected.name} ajouté.`);
    onAdded(data.dayExercise);
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="size-4" />
        Ajouter un exercice
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un exercice</DialogTitle>
          <DialogDescription>
            {selected
              ? "Définis les séries et répétitions cibles."
              : "Choisis un exercice."}
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
                <Label htmlFor="targetSets">Séries</Label>
                <Input
                  id="targetSets"
                  type="number"
                  {...register("targetSets", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetRepsMin">Reps min</Label>
                <Input
                  id="targetRepsMin"
                  type="number"
                  {...register("targetRepsMin", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetRepsMax">Reps max</Label>
                <Input
                  id="targetRepsMax"
                  type="number"
                  {...register("targetRepsMax", { valueAsNumber: true })}
                />
              </div>
            </div>
            {(errors.targetSets ||
              errors.targetRepsMin ||
              errors.targetRepsMax) && (
              <p className="text-sm text-destructive">
                Vérifie les valeurs saisies.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="targetWeight">Poids cible ({unitLabel}, optionnel)</Label>
                <Input
                  id="targetWeight"
                  inputMode="decimal"
                  placeholder="Ex : 80"
                  {...register("targetWeight", {
                    setValueAs: (v) => {
                      const n = optionalNumber(v);
                      return n === undefined ? undefined : fromDisplay(n);
                    },
                  })}
                />
                {errors.targetWeight && (
                  <p className="text-sm text-destructive">Renseigne un poids valide.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="restSeconds">Repos (s)</Label>
                <Input
                  id="restSeconds"
                  type="number"
                  placeholder="Ex : 90"
                  {...register("restSeconds", { setValueAs: optionalNumber })}
                />
                {errors.restSeconds && (
                  <p className="text-sm text-destructive">
                    {errors.restSeconds.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ex : tempo lent, pause en bas..."
                {...register("notes")}
              />
            </div>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={cn(isSubmitting && "opacity-70")}
              >
                {isSubmitting ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
