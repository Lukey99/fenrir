import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { programService } from "@/server/services/programService";
import { exerciseService } from "@/server/services/exerciseService";
import { NotFoundError } from "@/server/errors";
import { ProgramBuilder } from "@/components/programs/program-builder";
import type { ProgramDetailDTO } from "@/types/program";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  let program;
  try {
    program = await programService.get(id, session.user.id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const exercises = await exerciseService.listForUser(session.user.id);

  // Prisma's Decimal instances aren't plain-serializable across the RSC
  // boundary — convert to strings before handing off to the client component.
  const programDTO: ProgramDetailDTO = {
    id: program.id,
    name: program.name,
    description: program.description,
    status: program.status,
    days: program.days.map((day) => ({
      id: day.id,
      order: day.order,
      name: day.name,
      label: day.label,
      exercises: day.exercises.map((exercise) => ({
        id: exercise.id,
        order: exercise.order,
        exerciseId: exercise.exerciseId,
        exercise: exercise.exercise,
        targetSets: exercise.targetSets,
        targetRepsMin: exercise.targetRepsMin,
        targetRepsMax: exercise.targetRepsMax,
        targetWeight: exercise.targetWeight ? exercise.targetWeight.toString() : null,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes,
      })),
    })),
  };

  const exerciseOptions = exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
  }));

  return <ProgramBuilder initialProgram={programDTO} exercises={exerciseOptions} />;
}
