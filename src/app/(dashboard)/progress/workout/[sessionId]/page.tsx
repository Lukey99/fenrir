import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { workoutService } from "@/server/services/workoutService";
import { progressService, FREE_SESSIONS_ID } from "@/server/services/progressService";
import { NotFoundError } from "@/server/errors";
import { Button } from "@/components/ui/button";
import { SessionExerciseExplorer } from "@/components/progress/session-exercise-explorer";

export default async function SessionProgressPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { sessionId } = await params;

  let workoutSession;
  try {
    workoutSession = await workoutService.get(sessionId, session.user.id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const programId = workoutSession.programDay?.programId ?? null;
  const programName = workoutSession.programDay?.program.name ?? "Séances libres";
  const backHref = `/progress/program/${programId ?? FREE_SESSIONS_ID}`;

  const trainedExercises = workoutSession.exercises.filter(
    (exercise) =>
      exercise.action !== "SKIPPED" && exercise.sets.some((set) => set.completed && !set.isWarmup)
  );

  const exerciseHistories = await Promise.all(
    trainedExercises.map(async (exercise) => {
      const history = await progressService.getExerciseHistory(
        session.user.id,
        exercise.exerciseId,
        "all"
      );
      return {
        exerciseId: exercise.exerciseId,
        name: exercise.exercise.name,
        muscleGroup: exercise.exercise.muscleGroup,
        metrics: history?.metrics ?? null,
        series: history?.series ?? [],
        insights: history?.insights ?? [],
      };
    })
  );

  const header = (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-1 -ml-2 text-muted-foreground"
        render={<Link href={backHref} />}
        nativeButton={false}
      >
        <ArrowLeft className="size-4" />
        {programName}
      </Button>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {workoutSession.programDay?.name ?? "Séance libre"}
      </h1>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 md:h-[calc(100vh-8rem)] md:overflow-hidden">
      {trainedExercises.length === 0 ? (
        <>
          {header}
          <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
            Aucune série complétée pour cette séance.
          </div>
        </>
      ) : (
        <SessionExerciseExplorer header={header} exercises={exerciseHistories} />
      )}
    </div>
  );
}
