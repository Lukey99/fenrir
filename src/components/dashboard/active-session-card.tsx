"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

import { MagneticButton } from "@/components/ui/magnetic-button";

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function ActiveSessionCard({
  activeSession,
}: {
  activeSession: { sessionId: string; dayName: string | null; startedAt: string };
}) {
  const startedAtMs = new Date(activeSession.startedAt).getTime();
  const [now, setNow] = useState(startedAtMs);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col justify-between gap-1 rounded-2xl bg-[oklch(0.18_0.012_275)] p-3 text-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_40px_-16px_rgba(0,0,0,0.18)] md:rounded-3xl dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(0,0,0,0.6)]">
      <p className="text-sm text-white/70">Séance en cours</p>
      <div>
        <p className="font-heading text-2xl font-bold tabular-nums">
          {formatElapsed(now - startedAtMs)}
        </p>
        {activeSession.dayName && (
          <p className="truncate text-sm text-white/70">{activeSession.dayName}</p>
        )}
      </div>
      <MagneticButton
        size="sm"
        className="w-fit"
        render={<Link href={`/workout/${activeSession.sessionId}`} />}
        nativeButton={false}
      >
        <Play className="size-3.5" />
        Reprendre
      </MagneticButton>
    </div>
  );
}
