"use client";

import Link from "next/link";

import { useUnit } from "@/hooks/use-unit";
import { MagneticButton } from "@/components/ui/magnetic-button";

type PR = { exerciseId: string; exerciseName: string; weight: number; reps: number; date: string };

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
    <div className="md:h-full md:min-h-0 md:overflow-y-auto">
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">Exercice</th>
            <th className="pb-2 font-medium">Poids</th>
            <th className="pb-2 font-medium">Reps</th>
            <th className="pb-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {recentPRs.map((pr) => (
            <tr key={`${pr.exerciseId}-${pr.date}`} className="border-b last:border-0">
              <td className="truncate py-2 pr-2 font-medium">
                <Link href={`/records/${pr.exerciseId}`} className="hover:text-brand hover:underline">
                  {pr.exerciseName}
                </Link>
              </td>
              <td className="py-2 pr-2 text-muted-foreground">
                {toDisplay(pr.weight)} {unitLabel}
              </td>
              <td className="py-2 pr-2 text-muted-foreground">{pr.reps}</td>
              <td className="py-2 text-muted-foreground">{formatDate(pr.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="space-y-2 md:hidden">
        {recentPRs.map((pr) => (
          <li key={`${pr.exerciseId}-${pr.date}`}>
            <Link
              href={`/records/${pr.exerciseId}`}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{pr.exerciseName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(pr.date)}</p>
              </div>
              <span className="shrink-0 text-muted-foreground">
                {toDisplay(pr.weight)} {unitLabel} × {pr.reps}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
