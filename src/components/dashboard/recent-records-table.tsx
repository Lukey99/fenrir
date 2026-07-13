"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { useUnit } from "@/hooks/use-unit";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { muscleGroupColorClasses, type MuscleGroupValue } from "@/lib/constants";

type PR = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  date: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function RecentRecordsTable({ recentPRs }: { recentPRs: PR[] }) {
  const { unitLabel, toDisplay } = useUnit();

  if (recentPRs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Aucun record pour l&apos;instant. Ajoute ton premier record pour suivre tes
          performances au fil du temps.
        </p>
        <MagneticButton
          size="sm"
          variant="outline"
          className="w-fit"
          render={<Link href="/records" />}
          nativeButton={false}
        >
          Ajouter un record
        </MagneticButton>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {recentPRs.map((pr) => (
        <li key={`${pr.exerciseId}-${pr.date}`}>
          <Link
            href={`/records/${pr.exerciseId}`}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                muscleGroupColorClasses[pr.muscleGroup as MuscleGroupValue]
              }`}
            >
              <Dumbbell className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{pr.exerciseName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(pr.date)}</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              {toDisplay(pr.weight)} {unitLabel} × {pr.reps}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
