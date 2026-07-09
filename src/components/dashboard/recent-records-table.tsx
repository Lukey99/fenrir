"use client";

import { useUnit } from "@/hooks/use-unit";

type PR = { exerciseId: string; exerciseName: string; weight: number; reps: number; date: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function RecentRecordsTable({ recentPRs }: { recentPRs: PR[] }) {
  const { unitLabel, toDisplay } = useUnit();

  if (recentPRs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun record pour l&apos;instant. Termine une séance pour voir tes premiers
        PRs ici.
      </p>
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
              <td className="truncate py-2 pr-2 font-medium">{pr.exerciseName}</td>
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
          <li key={`${pr.exerciseId}-${pr.date}`} className="flex items-center justify-between gap-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{pr.exerciseName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(pr.date)}</p>
            </div>
            <span className="shrink-0 text-muted-foreground">
              {toDisplay(pr.weight)} {unitLabel} × {pr.reps}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
