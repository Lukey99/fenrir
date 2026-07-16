"use client";

import Link from "next/link";
import { CheckCircle2, Trophy } from "lucide-react";

import type { WorkoutSessionDTO } from "@/types/workout";
import { useUnit } from "@/hooks/use-unit";

import { Button } from "@/components/ui/button";

export type NewRecordEvent = { exerciseName: string; weight: number; reps: number };

export function SessionRecapScreen({
  session,
  elapsedSeconds,
  prsThisSession,
  onClose,
}: {
  session: WorkoutSessionDTO;
  elapsedSeconds: number;
  prsThisSession: NewRecordEvent[];
  onClose: () => void;
}) {
  const { unitLabel, toDisplay } = useUnit();

  const completedSets = session.exercises.flatMap((e) => e.sets).filter((s) => s.completed);
  const totalSetsCount = completedSets.length;
  const totalVolumeKg = completedSets.reduce(
    (sum, s) => sum + (s.weight && s.reps ? Number(s.weight) * s.reps : 0),
    0
  );
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-8 text-center">
      <div>
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/12 text-brand">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Séance terminée !</h1>
      </div>

      {totalSetsCount === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune série complétée aujourd&apos;hui.</p>
      ) : (
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <p className="font-heading text-lg font-semibold tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
            <p className="text-xs text-muted-foreground">Durée</p>
          </div>
          <div className="rounded-xl border p-3">
            <p className="font-heading text-lg font-semibold">{totalSetsCount}</p>
            <p className="text-xs text-muted-foreground">Séries</p>
          </div>
          <div className="col-span-2 rounded-xl border p-3">
            <p className="font-heading text-lg font-semibold">
              {toDisplay(totalVolumeKg)} {unitLabel}
            </p>
            <p className="text-xs text-muted-foreground">Volume total</p>
          </div>
        </div>
      )}

      {prsThisSession.length > 0 && (
        <div className="w-full max-w-xs space-y-2 text-left">
          <p className="text-sm font-medium">Nouveaux records</p>
          {prsThisSession.map((pr, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
            >
              <Trophy className="size-4 shrink-0 text-brand" />
              <span className="truncate">
                {pr.exerciseName} — {toDisplay(pr.weight)} {unitLabel} × {pr.reps}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href={`/progress/workout/${session.id}`}
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Voir le détail
      </Link>

      <Button size="lg" className="w-full max-w-xs" onClick={onClose}>
        Fermer
      </Button>
    </div>
  );
}
