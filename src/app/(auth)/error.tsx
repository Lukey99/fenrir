"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthError({
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
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </span>
        <div>
          <p className="font-medium">Une erreur est survenue</p>
          <p className="text-sm text-muted-foreground">
            Quelque chose s&apos;est mal passé. Réessaie dans un instant.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={reset}>
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
}
