"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createExerciseSchema, type CreateExerciseInput } from "@/server/validators/exercise";
import { muscleGroupLabels, muscleGroupOrder } from "@/lib/constants";
import type { Exercise } from "@/generated/prisma/client";

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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EditExerciseDialog({
  exercise,
  onOpenChange,
  onUpdated,
}: {
  exercise: Exercise;
  onOpenChange: (open: boolean) => void;
  onUpdated: (exercise: Exercise) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment ?? "",
    });
  }, [exercise, reset]);

  async function onSubmit(values: CreateExerciseInput) {
    setServerError(null);

    const response = await fetch(`/api/exercises/${exercise.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success(`"${data.exercise.name}" mis à jour.`);
    onUpdated(data.exercise);
    onOpenChange(false);
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) setServerError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l&apos;exercice</DialogTitle>
          <DialogDescription>Ajuste le nom, le groupe musculaire ou le matériel.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-exercise-name">Nom</Label>
            <Input id="edit-exercise-name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-exercise-muscle-group">Groupe musculaire</Label>
            <Controller
              name="muscleGroup"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="edit-exercise-muscle-group" className="w-full">
                    <SelectValue placeholder="Choisir un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroupOrder.map((group) => (
                      <SelectItem key={group} value={group}>
                        {muscleGroupLabels[group]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.muscleGroup && (
              <p className="text-sm text-destructive">{errors.muscleGroup.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-exercise-equipment">Matériel (optionnel)</Label>
            <Input id="edit-exercise-equipment" placeholder="Ex : Haltères" {...register("equipment")} />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
