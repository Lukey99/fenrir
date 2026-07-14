"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import { createProgramDaySchema, type CreateProgramDayInput } from "@/server/validators/program";
import type { ProgramDayDTO } from "@/types/program";
import { cn } from "@/lib/utils";

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

type CreateProps = {
  mode: "create";
  programId: string;
  onSaved: (day: ProgramDayDTO) => void;
};

type EditProps = {
  mode: "edit";
  programId: string;
  day: ProgramDayDTO;
  onSaved: (day: ProgramDayDTO) => void;
};

// 0=Dim..6=Sam, matches Date.getDay() — consistent with the field's DB convention.
const weekdayLabels = ["D", "L", "M", "M", "J", "V", "S"];

export function DayFormDialog(props: CreateProps | EditProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = props.mode === "edit";
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(
    isEdit ? props.day.preferredWeekdays : []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProgramDayInput>({
    resolver: zodResolver(createProgramDaySchema),
    defaultValues: isEdit
      ? { name: props.day.name, label: props.day.label ?? undefined }
      : { name: "", label: "" },
  });

  function toggleWeekday(day: number) {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function onSubmit(values: CreateProgramDayInput) {
    setServerError(null);

    const url = isEdit
      ? `/api/programs/${props.programId}/days/${props.day.id}`
      : `/api/programs/${props.programId}/days`;

    const response = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, preferredWeekdays: selectedWeekdays }),
    });

    const data = await response.json();
    if (!response.ok) {
      setServerError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    const saved = isEdit ? { ...props.day, ...data.day } : { ...data.day, exercises: [] };
    toast.success(isEdit ? "Jour mis à jour." : "Jour ajouté.");
    props.onSaved(saved);
    reset();
    if (!isEdit) setSelectedWeekdays([]);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setServerError(null);
      }}
    >
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label="Modifier le jour" />
          ) : (
            <Button variant="outline" />
          )
        }
      >
        {isEdit ? <Pencil className="size-3.5" /> : (
          <>
            <Plus className="size-4" />
            Ajouter un jour
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le jour" : "Ajouter un jour"}</DialogTitle>
          <DialogDescription>
            Ex : &quot;Push Day A&quot;, avec une étiquette comme &quot;Push&quot; ou
            &quot;Haut du corps&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="day-name">Nom</Label>
            <Input id="day-name" placeholder="Ex : Push Day A" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="day-label">Étiquette (optionnel)</Label>
            <Input id="day-label" placeholder="Ex : Push" {...register("label")} />
          </div>
          <div className="space-y-2">
            <Label>Jours préférés (optionnel)</Label>
            <p className="text-xs text-muted-foreground">
              Utilisés pour te suggérer cette séance sur le tableau de bord.
            </p>
            <div className="flex gap-1.5">
              {weekdayLabels.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  aria-pressed={selectedWeekdays.includes(day)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    selectedWeekdays.includes(day)
                      ? "border-transparent bg-brand text-brand-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
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
