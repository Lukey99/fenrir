"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import { createProgramDaySchema, type CreateProgramDayInput } from "@/server/validators/program";
import type { ProgramDayDTO } from "@/types/program";

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

export function DayFormDialog(props: CreateProps | EditProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = props.mode === "edit";

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

  async function onSubmit(values: CreateProgramDayInput) {
    setServerError(null);

    const url = isEdit
      ? `/api/programs/${props.programId}/days/${props.day.id}`
      : `/api/programs/${props.programId}/days`;

    const response = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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
