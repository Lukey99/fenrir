import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus, Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { progressService } from "@/server/services/progressService";
import { ProgressProgramsList } from "@/components/progress/progress-programs-list";
import { Button } from "@/components/ui/button";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const programs = await progressService.listPrograms(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Progression</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {programs.length > 0
              ? `${programs.length} programme${programs.length > 1 ? "s" : ""} suivi${programs.length > 1 ? "s" : ""}.`
              : "Termine une séance pour commencer à voir ta progression."}
          </p>
        </div>
        <Button variant="outline" render={<Link href="/progress/add" />} nativeButton={false}>
          <CalendarPlus className="size-4" />
          Ajouter une séance passée
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="font-medium">Pas encore d&apos;historique</p>
            <p className="text-sm text-muted-foreground">
              Démarre et termine une séance pour voir tes programmes apparaître ici.
            </p>
          </div>
        </div>
      ) : (
        <ProgressProgramsList
          programs={programs.map((p) => ({ ...p, lastTrainedAt: p.lastTrainedAt.toISOString() }))}
        />
      )}
    </div>
  );
}
