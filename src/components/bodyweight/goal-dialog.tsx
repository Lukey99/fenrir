"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Target } from "lucide-react";
import { toast } from "sonner";

import { setWeightGoalSchema, type SetWeightGoalInput } from "@/server/validators/bodyweight";
import type { WeightGoalDTO } from "@/types/bodyweight";
import { useUnit } from "@/hooks/use-unit";
import { decimalNumber, optionalString, cn } from "@/lib/utils";

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

export function GoalDialog({
  goal,
  onSaved,
}: {
  goal: WeightGoalDTO | null;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { unitLabel, toDisplay, fromDisplay } = useUnit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SetWeightGoalInput>({
    resolver: zodResolver(setWeightGoalSchema),
    defaultValues: {
      targetWeight: goal ? toDisplay(goal.targetWeight) : undefined,
      targetDate: goal?.targetDate ?? undefined,
    },
  });

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setServerError(null);
      reset({
        targetWeight: goal ? toDisplay(goal.targetWeight) : undefined,
        targetDate: goal?.targetDate ?? undefined,
      });
    }
  }

  async function onSubmit(values: SetWeightGoalInput) {
    setServerError(null);

    const response = await fetch("/api/bodyweight/goal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success("Objectif enregistré.");
    onSaved();
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Target className="size-4" />
        {goal ? "Modifier l'objectif" : "Définir un objectif"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? "Modifier l'objectif" : "Définir un objectif"}</DialogTitle>
          <DialogDescription>Choisis un poids cible, avec une date optionnelle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-weight">Poids cible ({unitLabel})</Label>
              <Input
                id="goal-weight"
                inputMode="decimal"
                placeholder="Ex : 75"
                {...register("targetWeight", { setValueAs: (v) => fromDisplay(decimalNumber(v)) })}
              />
              {errors.targetWeight && (
                <p className="text-sm text-destructive">Renseigne un poids valide.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-date">Date cible (optionnel)</Label>
              <Input
                id="goal-date"
                type="date"
                {...register("targetDate", { setValueAs: optionalString })}
              />
            </div>
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={cn(isSubmitting && "opacity-70")}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
