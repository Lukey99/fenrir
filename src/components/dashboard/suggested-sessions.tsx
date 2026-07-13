import Link from "next/link";

import { MagneticButton } from "@/components/ui/magnetic-button";
import { StartSessionButton } from "@/components/workout/start-session-button";

export function SuggestedSessions({
  suggestedSessions,
}: {
  suggestedSessions: { programDayId: string; programName: string; dayName: string; label: string | null }[];
}) {
  if (suggestedSessions.length === 0) {
    return (
      <div className="flex h-full flex-col justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Aucune séance prévue aujourd&apos;hui. Ajoute des jours préférés à tes
          programmes pour voir des suggestions ici.
        </p>
        <MagneticButton
          size="sm"
          variant="outline"
          className="w-fit"
          render={<Link href="/programs" />}
          nativeButton={false}
        >
          Voir mes programmes
        </MagneticButton>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {suggestedSessions.map((suggestion) => (
        <div
          key={suggestion.programDayId}
          className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{suggestion.dayName}</p>
            <p className="truncate text-xs text-muted-foreground">{suggestion.programName}</p>
          </div>
          <StartSessionButton size="sm" programDayId={suggestion.programDayId} />
        </div>
      ))}
    </div>
  );
}
