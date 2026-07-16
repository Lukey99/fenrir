"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintToolbar({ programId }: { programId: string }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-2 print:hidden">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link href={`/programs/${programId}`} />}
        nativeButton={false}
      >
        <ArrowLeft className="size-4" />
        Retour au programme
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer className="size-4" />
        Imprimer / Exporter en PDF
      </Button>
    </div>
  );
}
