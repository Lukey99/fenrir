"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileDown } from "lucide-react";

import type { ProgramDetailDTO, ProgramDayDTO, ProgramDayExerciseDTO } from "@/types/program";
import { muscleGroupLabels } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DayFormDialog } from "@/components/programs/day-form-dialog";
import { DayCard } from "@/components/programs/day-card";
import { EditProgramDialog } from "@/components/programs/edit-program-dialog";

type ExerciseOption = {
  id: string;
  name: string;
  muscleGroup: keyof typeof muscleGroupLabels;
  equipment: string | null;
};

export function ProgramBuilder({
  initialProgram,
  exercises,
}: {
  initialProgram: ProgramDetailDTO;
  exercises: ExerciseOption[];
}) {
  const [program, setProgram] = useState(initialProgram);
  const isArchived = program.status === "ARCHIVED";

  function updateDay(dayId: string, updater: (day: ProgramDayDTO) => ProgramDayDTO) {
    setProgram((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? updater(d) : d)),
    }));
  }

  async function handleDayMove(dayId: string, direction: "up" | "down") {
    const index = program.days.findIndex((d) => d.id === dayId);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= program.days.length) return;

    const current = program.days[index];
    const swap = program.days[swapIndex];
    const reordered = [...program.days];
    reordered[index] = swap;
    reordered[swapIndex] = current;
    setProgram((prev) => ({ ...prev, days: reordered }));

    await Promise.all([
      fetch(`/api/programs/${program.id}/days/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: swapIndex }),
      }),
      fetch(`/api/programs/${program.id}/days/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index }),
      }),
    ]);
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground"
          render={<Link href="/programs" />} nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Programmes
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{program.name}</h1>
          <Badge variant={isArchived ? "outline" : "secondary"}>
            {isArchived ? "Archivé" : "Actif"}
          </Badge>
          <EditProgramDialog program={program} onUpdated={setProgram} />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            render={<Link href={`/programs/${program.id}/print`} target="_blank" />}
            nativeButton={false}
          >
            <FileDown className="size-4" />
            Exporter en PDF
          </Button>
        </div>
        {program.description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{program.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {program.days.map((day, index) => (
          <DayCard
            key={day.id}
            programId={program.id}
            day={day}
            exercises={exercises}
            isFirst={index === 0}
            isLast={index === program.days.length - 1}
            onDayUpdated={(updated) => updateDay(day.id, () => updated)}
            onDayRemoved={(id) =>
              setProgram((prev) => ({ ...prev, days: prev.days.filter((d) => d.id !== id) }))
            }
            onDayMove={handleDayMove}
            onExercisesChange={(dayId, dayExercises: ProgramDayExerciseDTO[]) =>
              updateDay(dayId, (d) => ({ ...d, exercises: dayExercises }))
            }
          />
        ))}

        {program.days.length === 0 && (
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            Ce programme n&apos;a pas encore de jour.
          </div>
        )}

        <DayFormDialog
          mode="create"
          programId={program.id}
          onSaved={(day) => setProgram((prev) => ({ ...prev, days: [...prev.days, day] }))}
        />
      </div>
    </div>
  );
}
