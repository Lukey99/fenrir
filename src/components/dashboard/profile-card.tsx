"use client";

import Link from "next/link";

import { useUnit } from "@/hooks/use-unit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CountUp } from "@/components/ui/count-up";
import { initials } from "@/lib/utils";

function Stat({
  label,
  value,
  countUp,
}: {
  label: string;
  value: string;
  /** When set, animates in as a count-up instead of rendering `value` directly. */
  countUp?: { value: number; decimals?: number; suffix?: string };
}) {
  return (
    <div className="min-w-0 md:flex md:w-full md:items-center md:justify-between md:gap-3 md:border-b md:border-border md:py-1.5 md:last:border-0">
      <p className="text-xs text-muted-foreground md:order-1">{label}</p>
      <p className="truncate font-heading text-lg font-semibold md:order-2 md:text-sm">
        {countUp ? (
          <CountUp value={countUp.value} decimals={countUp.decimals} suffix={countUp.suffix} />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

export function ProfileCard({
  profile,
}: {
  profile: {
    name: string | null;
    heightCm: number | null;
    latestBodyWeight: number | null;
    totalSessions: number;
  };
}) {
  const { unitLabel, toDisplay } = useUnit();

  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-3 overflow-hidden md:items-center md:text-center">
      <div className="flex items-center gap-4 md:flex-col md:gap-2">
        <Avatar className="size-16">
          <AvatarFallback className="bg-brand text-xl text-brand-foreground">
            {initials(profile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold">
            {profile.name ?? "Mon profil"}
          </p>
          <Link href="/settings" className="text-xs text-muted-foreground hover:text-foreground">
            Modifier mon profil
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 md:w-full md:grid-cols-1 md:gap-0">
        <Stat
          label="Taille"
          value={profile.heightCm ? `${profile.heightCm} cm` : "—"}
          countUp={profile.heightCm ? { value: profile.heightCm, suffix: " cm" } : undefined}
        />
        <Stat
          label="Poids"
          value={
            profile.latestBodyWeight != null
              ? `${toDisplay(profile.latestBodyWeight)} ${unitLabel}`
              : "—"
          }
          countUp={
            profile.latestBodyWeight != null
              ? { value: toDisplay(profile.latestBodyWeight), decimals: 1, suffix: ` ${unitLabel}` }
              : undefined
          }
        />
        <Stat
          label="Séances"
          value={String(profile.totalSessions)}
          countUp={{ value: profile.totalSessions }}
        />
      </div>
    </div>
  );
}
