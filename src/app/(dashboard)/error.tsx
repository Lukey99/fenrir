"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div>
        <p className="font-medium">Une erreur est survenue</p>
        <p className="text-sm text-muted-foreground">
          Quelque chose s&apos;est mal passé en chargeant cette page.
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={reset}>
          Réessayer
        </Button>
        <Button size="sm" render={<Link href="/dashboard" />} nativeButton={false}>
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
