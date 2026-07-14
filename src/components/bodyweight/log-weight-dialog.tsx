"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { logBodyWeightEntrySchema, type LogBodyWeightEntryInput } from "@/server/validators/bodyweight";
import { useUnit } from "@/hooks/use-unit";
import { decimalNumber, cn } from "@/lib/utils";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export function LogWeightDialog({ onLogged }: { onLogged: () => void }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { unitLabel, fromDisplay } = useUnit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogBodyWeightEntryInput>({
    resolver: zodResolver(logBodyWeightEntrySchema),
    defaultValues: { date: todayKey() },
  });

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setServerError(null);
      reset({ date: todayKey() });
    }
  }

  async function onSubmit(values: LogBodyWeightEntryInput) {
    setServerError(null);

    const response = await fetch("/api/bodyweight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    toast.success("Pesée enregistrée.");
    onLogged();
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        Ajouter une pesée
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une pesée</DialogTitle>
          <DialogDescription>
            Une seule pesée par jour : une nouvelle valeur remplace celle du jour existant.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight-date">Date</Label>
              <Input id="weight-date" type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-value">Poids ({unitLabel})</Label>
              <Input
                id="weight-value"
                inputMode="decimal"
                placeholder="Ex : 82,5"
                {...register("weight", { setValueAs: (v) => fromDisplay(decimalNumber(v)) })}
              />
              {errors.weight && (
                <p className="text-sm text-destructive">Renseigne un poids valide.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight-note">Note (optionnel)</Label>
            <Input id="weight-note" placeholder="Ex : à jeun, après entraînement..." {...register("note")} />
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
