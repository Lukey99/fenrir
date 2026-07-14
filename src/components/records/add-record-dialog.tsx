"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
  createPersonalRecordSchema,
  type CreatePersonalRecordInput,
} from "@/server/validators/personalRecord";
import { useUnit } from "@/hooks/use-unit";
import { decimalNumber } from "@/lib/utils";
import { ExercisePicker, type ExercisePickerOption } from "@/components/exercises/exercise-picker";
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

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddRecordDialog({ exercises }: { exercises: ExercisePickerOption[] }) {
  const router = useRouter();
  const { unitLabel, fromDisplay } = useUnit();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExercisePickerOption | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePersonalRecordInput>({
    resolver: zodResolver(createPersonalRecordSchema),
    defaultValues: { achievedAt: todayKey() },
  });

  function selectExercise(exercise: ExercisePickerOption) {
    setSelected(exercise);
    setValue("exerciseId", exercise.id, { shouldValidate: true });
  }

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setServerError(null);
      setSelected(null);
      reset({ achievedAt: todayKey() });
    }
  }

  async function onSubmit(values: CreatePersonalRecordInput) {
    setServerError(null);

    const response = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success("Record ajouté.");
    close(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Ajouter un record
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un record</DialogTitle>
          <DialogDescription>
            {selected ? selected.name : "Choisis l'exercice, puis renseigne ton record."}
          </DialogDescription>
        </DialogHeader>

        {!selected ? (
          <ExercisePicker exercises={exercises} onSelect={selectExercise} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 w-fit text-muted-foreground"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft className="size-3.5" />
              Changer d&apos;exercice
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="record-weight">Poids ({unitLabel})</Label>
                <Input
                  id="record-weight"
                  inputMode="decimal"
                  placeholder="Ex : 82,5"
                  {...register("weight", { setValueAs: (v) => fromDisplay(decimalNumber(v)) })}
                />
                {errors.weight && <p className="text-sm text-destructive">Poids invalide.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="record-reps">Reps</Label>
                <Input
                  id="record-reps"
                  inputMode="numeric"
                  placeholder="Ex : 5"
                  {...register("reps", { setValueAs: decimalNumber })}
                />
                {errors.reps && <p className="text-sm text-destructive">Reps invalides.</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="record-date">Date</Label>
              <Input id="record-date" type="date" max={todayKey()} {...register("achievedAt")} />
              {errors.achievedAt && (
                <p className="text-sm text-destructive">{errors.achievedAt.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <DialogFooter>
              <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
