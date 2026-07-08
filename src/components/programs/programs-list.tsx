"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";

import type { Program } from "@/generated/prisma/client";
import { CreateProgramDialog } from "@/components/programs/create-program-dialog";
import { ProgramCard } from "@/components/programs/program-card";

type ProgramWithCount = Program & { _count: { days: number } };

export function ProgramsList({ initialPrograms }: { initialPrograms: ProgramWithCount[] }) {
  const [programs, setPrograms] = useState(initialPrograms);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Programmes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {programs.length} programme{programs.length > 1 ? "s" : ""}.
          </p>
        </div>
        <CreateProgramDialog
          onCreated={(program) => setPrograms((prev) => [program, ...prev])}
        />
      </div>

      {programs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Dumbbell className="size-6" />
          </span>
          <div>
            <p className="font-medium">Aucun programme pour l&apos;instant</p>
            <p className="text-sm text-muted-foreground">
              Crée ton premier programme pour organiser tes séances.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <ProgramCard
              key={program.id}
              program={program}
              index={index}
              onDuplicated={(created) => setPrograms((prev) => [created, ...prev])}
              onStatusChanged={(updated) =>
                setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
              }
              onDeleted={(id) => setPrograms((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
