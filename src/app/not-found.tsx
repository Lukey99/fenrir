import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Compass className="size-6" />
      </span>
      <div>
        <p className="font-heading text-xl font-semibold">Page introuvable</p>
        <p className="text-sm text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Button size="sm" render={<Link href="/dashboard" />} nativeButton={false}>
        Retour au tableau de bord
      </Button>
    </div>
  );
}
