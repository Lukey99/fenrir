"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormGetValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createManualSessionSchema,
  type CreateManualSessionInput,
} from "@/server/validators/workout";
import { optionalNumber } from "@/lib/utils";
import { useUnit } from "@/hooks/use-unit";
import type { MuscleGroupValue } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExercisePicker, type ExercisePickerOption } from "@/components/exercises/exercise-picker";

export type ManualSessionProgramOption = {
  id: string;
  name: string;
  days: {
    id: string;
    name: string;
    label: string | null;
    exercises: {
      id: string;
      exerciseId: string;
      name: string;
      muscleGroup: MuscleGroupValue;
      equipment: string | null;
      targetSets: number;
      defaultWeight: number | null;
    }[];
  }[];
};

type PickedExercise = { id: string; name: string };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function SetsFieldArray({
  control,
  register,
  getValues,
  exerciseIndex,
  unitLabel,
  toDisplay,
  fromDisplay,
}: {
  control: Control<CreateManualSessionInput>;
  register: UseFormRegister<CreateManualSessionInput>;
  getValues: UseFormGetValues<CreateManualSessionInput>;
  exerciseIndex: number;
  unitLabel: string;
  toDisplay: (value: number) => number;
  fromDisplay: (value: number) => number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  function addSet() {
    const prevWeight = getValues(`exercises.${exerciseIndex}.sets.${fields.length - 1}.weight`);
    append({
      weight: typeof prevWeight === "number" ? toDisplay(prevWeight) : undefined,
      reps: undefined,
    });
  }

  return (
    <div className="space-y-2">
      {fields.map((field, setIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="w-4 shrink-0 text-xs text-muted-foreground">{setIndex + 1}</span>
          <Input
            inputMode="decimal"
            placeholder={`Poids (${unitLabel})`}
            {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weight`, {
              setValueAs: (value: string | number | undefined) => {
                const n = optionalNumber(value);
                return n === undefined ? undefined : fromDisplay(n);
              },
            })}
          />
          <Input
            inputMode="numeric"
            placeholder="Reps"
            {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, {
              setValueAs: optionalNumber,
            })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Retirer la série"
            disabled={fields.length <= 1}
            onClick={() => remove(setIndex)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={addSet}>
        <Plus className="size-4" />
        Ajouter une série
      </Button>
    </div>
  );
}

export function ManualSessionForm({
  exercises,
  programs,
  defaultWeights,
}: {
  exercises: ExercisePickerOption[];
  programs: ManualSessionProgramOption[];
  defaultWeights: Record<string, number>;
}) {
  const [picking, setPicking] = useState(false);
  const [pickedExercises, setPickedExercises] = useState<PickedExercise[]>([]);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { unitLabel, toDisplay, fromDisplay } = useUnit();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateManualSessionInput>({
    resolver: zodResolver(createManualSessionSchema),
    defaultValues: { date: todayKey(), exercises: [] },
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "exercises" });

  function selectDay(dayId: string) {
    setSelectedDayId(dayId);
    setPicking(false);

    if (!dayId) {
      replace([]);
      setPickedExercises([]);
      return;
    }

    const day = programs.flatMap((program) => program.days).find((d) => d.id === dayId);
    if (!day) return;

    replace(
      day.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sourceProgramDayExerciseId: ex.id,
        sets: Array.from({ length: ex.targetSets }, () => ({
          weight: ex.defaultWeight !== null ? toDisplay(ex.defaultWeight) : undefined,
          reps: undefined,
        })),
      }))
    );
    setPickedExercises(day.exercises.map((ex) => ({ id: ex.exerciseId, name: ex.name })));
  }

  function addExercise(exercise: ExercisePickerOption) {
    setPickedExercises((prev) => [...prev, exercise]);
    const defaultWeightKg = defaultWeights[exercise.id];
    append({
      exerciseId: exercise.id,
      sets: [{ weight: defaultWeightKg !== undefined ? toDisplay(defaultWeightKg) : undefined, reps: undefined }],
    });
    setPicking(false);
  }

  function removeExercise(index: number) {
    remove(index);
    setPickedExercises((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: CreateManualSessionInput) {
    setServerError(null);

    const response = await fetch("/api/workouts/sessions/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, programDayId: selectedDayId || undefined }),
    });

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success("Séance ajoutée.");
    router.push("/progress");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="manual-date">Date</Label>
          <Input id="manual-date" type="date" max={todayKey()} {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-program-day">Programme</Label>
          <select
            id="manual-program-day"
            value={selectedDayId}
            onChange={(event) => selectDay(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Séance libre (sans programme)</option>
            {programs.map((program) =>
              program.days.map((day) => (
                <option key={day.id} value={day.id}>
                  {program.name} — {day.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {fields.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-medium">
                  {pickedExercises[index]?.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Retirer l'exercice"
                  onClick={() => removeExercise(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <SetsFieldArray
                control={control}
                register={register}
                getValues={getValues}
                exerciseIndex={index}
                unitLabel={unitLabel}
                toDisplay={toDisplay}
                fromDisplay={fromDisplay}
              />
            </div>
          ))}
        </div>
      )}

      {picking ? (
        <div className="max-w-lg space-y-2">
          <ExercisePicker exercises={exercises} onSelect={addExercise} />
          <Button type="button" variant="ghost" size="sm" onClick={() => setPicking(false)}>
            Annuler
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setPicking(true)}>
          <Plus className="size-4" />
          Ajouter un exercice
        </Button>
      )}
      {errors.exercises?.message && (
        <p className="text-sm text-destructive">{errors.exercises.message}</p>
      )}

      <div className="max-w-lg space-y-2">
        <Label htmlFor="manual-notes">Notes (optionnel)</Label>
        <Input id="manual-notes" placeholder="Ex : séance à la salle du travail" {...register("notes")} />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer la séance"}
      </Button>
    </form>
  );
}
