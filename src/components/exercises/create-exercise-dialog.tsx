"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateExerciseDialog({
  onCreated,
}: {
  onCreated: (exercise: Exercise) => void;
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExerciseInput>({ resolver: zodResolver(createExerciseSchema) });

  async function onSubmit(values: CreateExerciseInput) {
    setServerError(null);

    const response = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success(`"${data.exercise.name}" ajouté à ta base d'exercices.`);
    onCreated(data.exercise);
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          reset();
          setServerError(null);
        }
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        Nouvel exercice
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un exercice</DialogTitle>
          <DialogDescription>
            Il sera ajouté à ta base personnelle, en plus des exercices intégrés.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-name">Nom</Label>
            <Input id="exercise-name" placeholder="Ex : Développé couché prise large" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="exercise-muscle-group">Groupe musculaire</Label>
            <Controller
              name="muscleGroup"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="exercise-muscle-group" className="w-full">
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
            <Label htmlFor="exercise-equipment">Matériel (optionnel)</Label>
            <Input id="exercise-equipment" placeholder="Ex : Haltères" {...register("equipment")} />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer l'exercice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
