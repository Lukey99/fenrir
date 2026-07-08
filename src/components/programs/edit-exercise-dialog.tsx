"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  updateProgramDayExerciseSchema,
  type UpdateProgramDayExerciseInput,
} from "@/server/validators/program";
import type { ProgramDayExerciseDTO } from "@/types/program";
import { optionalNumber } from "@/lib/utils";
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

export function EditExerciseDialog({
  programId,
  dayId,
  dayExercise,
  onUpdated,
}: {
  programId: string;
  dayId: string;
  dayExercise: ProgramDayExerciseDTO;
  onUpdated: (dayExercise: ProgramDayExerciseDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { unitLabel, toDisplay, fromDisplay } = useUnit();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProgramDayExerciseInput>({
    resolver: zodResolver(updateProgramDayExerciseSchema),
    defaultValues: {
      targetSets: dayExercise.targetSets,
      targetRepsMin: dayExercise.targetRepsMin,
      targetRepsMax: dayExercise.targetRepsMax,
      targetWeight: dayExercise.targetWeight ? toDisplay(Number(dayExercise.targetWeight)) : undefined,
      restSeconds: dayExercise.restSeconds ?? undefined,
      notes: dayExercise.notes ?? undefined,
    },
  });

  async function onSubmit(values: UpdateProgramDayExerciseInput) {
    setServerError(null);

    const response = await fetch(
      `/api/programs/${programId}/days/${dayId}/exercises/${dayExercise.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success("Exercice mis à jour.");
    onUpdated(data.dayExercise);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Modifier" />}>
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dayExercise.exercise.name}</DialogTitle>
          <DialogDescription>Modifie les séries et répétitions cibles.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-targetSets">Séries</Label>
              <Input
                id="edit-targetSets"
                type="number"
                {...register("targetSets", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-targetRepsMin">Reps min</Label>
              <Input
                id="edit-targetRepsMin"
                type="number"
                {...register("targetRepsMin", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-targetRepsMax">Reps max</Label>
              <Input
                id="edit-targetRepsMax"
                type="number"
                {...register("targetRepsMax", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-targetWeight">Poids cible ({unitLabel})</Label>
              <Input
                id="edit-targetWeight"
                inputMode="decimal"
                placeholder="Ex : 80"
                {...register("targetWeight", {
                  setValueAs: (v) => {
                    const n = optionalNumber(v);
                    return n === undefined ? null : fromDisplay(n);
                  },
                })}
              />
              {errors.targetWeight && (
                <p className="text-sm text-destructive">Renseigne un poids valide.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-restSeconds">Repos (s)</Label>
              <Input
                id="edit-restSeconds"
                type="number"
                {...register("restSeconds", { setValueAs: optionalNumber })}
              />
              {errors.restSeconds && (
                <p className="text-sm text-destructive">{errors.restSeconds.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (optionnel)</Label>
            <Textarea id="edit-notes" {...register("notes")} />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
