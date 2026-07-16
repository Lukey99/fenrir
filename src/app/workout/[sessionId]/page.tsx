import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { workoutService } from "@/server/services/workoutService";
import { exerciseService } from "@/server/services/exerciseService";
import { NotFoundError } from "@/server/errors";
import { GuidedWorkoutSession } from "@/components/workout/guided-workout-session";
import type { WorkoutSessionDTO } from "@/types/workout";

export default async function WorkoutSessionPage({
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

  const exercises = await exerciseService.listForUser(session.user.id);

  // Prisma's Decimal/Date instances aren't plain-serializable across the RSC
  // boundary — convert to strings before handing off to the client component.
  const sessionDTO: WorkoutSessionDTO = {
    id: workoutSession.id,
    programDayId: workoutSession.programDayId,
    programDay: workoutSession.programDay,
    status: workoutSession.status,
    startedAt: workoutSession.startedAt.toISOString(),
    completedAt: workoutSession.completedAt ? workoutSession.completedAt.toISOString() : null,
    notes: workoutSession.notes,
    exercises: workoutSession.exercises.map((exercise) => ({
      id: exercise.id,
      order: exercise.order,
      exerciseId: exercise.exerciseId,
      exercise: exercise.exercise,
      sourceProgramDayExerciseId: exercise.sourceProgramDayExerciseId,
      action: exercise.action,
      targetSets: exercise.targetSets,
      targetRepsMin: exercise.targetRepsMin,
      targetRepsMax: exercise.targetRepsMax,
      targetWeight: exercise.targetWeight ? exercise.targetWeight.toString() : null,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
      supersetGroup: exercise.supersetGroup,
      sets: exercise.sets.map((set) => ({
        id: set.id,
        setNumber: set.setNumber,
        weight: set.weight ? set.weight.toString() : null,
        reps: set.reps,
        rpe: set.rpe ? set.rpe.toString() : null,
        notes: set.notes,
        isWarmup: set.isWarmup,
        completed: set.completed,
        completedAt: set.completedAt ? set.completedAt.toISOString() : null,
      })),
    })),
  };

  const exerciseOptions = exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
  }));

  return <GuidedWorkoutSession initialSession={sessionDTO} exercises={exerciseOptions} />;
}
