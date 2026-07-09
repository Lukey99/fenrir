"use client";

import Link from "next/link";

import { useUnit } from "@/hooks/use-unit";
import { PhotoForm } from "@/components/settings/photo-form";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 md:flex md:w-full md:items-center md:justify-between md:gap-3 md:border-b md:border-border md:py-1.5 md:last:border-0">
      <p className="text-xs text-muted-foreground md:order-1">{label}</p>
      <p className="truncate font-heading text-lg font-semibold md:order-2 md:text-sm">
        {value}
      </p>
    </div>
  );
}

export function ProfileCard({
  profile,
}: {
  profile: {
    name: string | null;
    image: string | null;
    heightCm: number | null;
    latestBodyWeight: number | null;
    totalSessions: number;
  };
}) {
  const { unitLabel, toDisplay } = useUnit();

  return (
    <div className="flex h-full min-h-0 flex-col justify-center gap-3 overflow-hidden md:items-center md:text-center">
      <div className="flex items-center gap-4 md:flex-col md:gap-2">
        <PhotoForm image={profile.image} name={profile.name} size={64} />
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
        <Stat label="Taille" value={profile.heightCm ? `${profile.heightCm} cm` : "—"} />
        <Stat
          label="Poids"
          value={
            profile.latestBodyWeight != null
              ? `${toDisplay(profile.latestBodyWeight)} ${unitLabel}`
              : "—"
          }
        />
        <Stat label="Séances" value={String(profile.totalSessions)} />
      </div>
    </div>
  );
}
