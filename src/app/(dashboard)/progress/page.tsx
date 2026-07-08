import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus, Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { progressService } from "@/server/services/progressService";
import { ProgressExercisesList } from "@/components/progress/progress-exercises-list";
import { Button } from "@/components/ui/button";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exercises = await progressService.listTrainedExercises(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Progression</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {exercises.length > 0
              ? `${exercises.length} exercice${exercises.length > 1 ? "s" : ""} suivi${exercises.length > 1 ? "s" : ""}.`
              : "Termine une séance pour commencer à voir ta progression."}
          </p>
        </div>
        <Button variant="outline" render={<Link href="/progress/add" />} nativeButton={false}>
          <CalendarPlus className="size-4" />
          Ajouter une séance passée
        </Button>
      </div>

      {exercises.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="font-medium">Pas encore d&apos;historique</p>
            <p className="text-sm text-muted-foreground">
              Démarre et termine une séance pour voir tes exercices apparaître ici.
            </p>
          </div>
        </div>
      ) : (
        <ProgressExercisesList
          exercises={exercises.map((e) => ({ ...e, lastTrainedAt: e.lastTrainedAt.toISOString() }))}
        />
      )}
    </div>
  );
}
