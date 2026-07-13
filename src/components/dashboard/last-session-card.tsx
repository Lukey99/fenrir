import Link from "next/link";
import { History } from "lucide-react";

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const dayMs = 86_400_000;
  const diffDays = Math.round((Date.now() - date.getTime()) / dayMs);

  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function LastSessionCard({
  lastSession,
}: {
  lastSession: {
    sessionId: string;
    dayName: string | null;
    date: string;
    exercises: string[];
  } | null;
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-3 rounded-2xl bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)] md:rounded-3xl dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(0,0,0,0.6)]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="size-4" />
          Dernière séance
        </div>

        {lastSession ? (
          <>
            <p className="mt-2 font-heading text-lg font-semibold">
              {lastSession.dayName ?? "Séance libre"}
            </p>
            <p className="text-sm text-muted-foreground">{formatRelativeDate(lastSession.date)}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune séance enregistrée pour l&apos;instant.
          </p>
        )}
      </div>

      {lastSession && lastSession.exercises.length > 0 && (
        <p className="truncate text-sm text-muted-foreground">{lastSession.exercises.join(", ")}</p>
      )}

      {lastSession && (
        <Link
          href={`/progress/workout/${lastSession.sessionId}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          Voir le récap
        </Link>
      )}
    </div>
  );
}
