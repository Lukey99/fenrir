import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { progressService } from "@/server/services/progressService";
import { Button } from "@/components/ui/button";
import { SessionTypesList } from "@/components/progress/session-types-list";
import { ProgressExercisesList } from "@/components/progress/progress-exercises-list";

export default async function ProgramProgressPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { programId } = await params;

  const detail = await progressService.getProgramDetail(session.user.id, programId);
  if (!detail) notFound();

  const totalSessions = detail.sessionTypes.reduce((sum, t) => sum + t.sessionsCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground"
          render={<Link href="/progress" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Progression
        </Button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{detail.programName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalSessions} séance{totalSessions > 1 ? "s" : ""} · {detail.exercises.length} exercice
          {detail.exercises.length > 1 ? "s" : ""}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Types de séances</h2>
        <SessionTypesList
          sessionTypes={detail.sessionTypes.map((t) => ({
            ...t,
            lastTrainedAt: t.lastTrainedAt.toISOString(),
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Exercices</h2>
        <ProgressExercisesList
          exercises={detail.exercises.map((e) => ({ ...e, lastTrainedAt: e.lastTrainedAt.toISOString() }))}
        />
      </section>
    </div>
  );
}
