import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { MagneticButton } from "@/components/ui/magnetic-button";
import { StartSessionButton } from "@/components/workout/start-session-button";

const cardRounding = "rounded-2xl md:rounded-3xl";

export function TodaySessionCard({
  suggestedSessions,
}: {
  suggestedSessions: {
    programDayId: string;
    programName: string;
    dayName: string;
    label: string | null;
  }[];
}) {
  if (suggestedSessions.length === 0) {
    return (
      <div
        className={`flex h-full flex-col justify-between gap-4 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(0,0,0,0.6)] ${cardRounding}`}
      >
        <div>
          <p className="font-heading text-base font-medium">Séance du jour</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Aucune séance prévue aujourd&apos;hui. Ajoute des jours préférés à tes programmes
            pour voir des suggestions ici.
          </p>
        </div>
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

  const [first, ...rest] = suggestedSessions;

  return (
    <div
      className={`flex h-full flex-col justify-between gap-4 bg-(image:--brand-gradient) p-5 text-brand-foreground shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(0,0,0,0.6)] ${cardRounding}`}
    >
      <div>
        <div className="flex items-center gap-2 text-sm text-brand-foreground/80">
          <CalendarClock className="size-4" />
          Séance du jour
        </div>
        <p className="mt-3 font-heading text-lg font-semibold">{first.dayName}</p>
        <p className="text-sm text-brand-foreground/75">{first.programName}</p>
        {rest.length > 0 && (
          <p className="mt-1 text-xs text-brand-foreground/70">
            +{rest.length} autre{rest.length > 1 ? "s" : ""} séance{rest.length > 1 ? "s" : ""} suggérée
            {rest.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
      <StartSessionButton programDayId={first.programDayId} variant="secondary" />
    </div>
  );
}
