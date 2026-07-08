import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { exerciseService } from "@/server/services/exerciseService";
import { programService } from "@/server/services/programService";
import { workoutService } from "@/server/services/workoutService";
import { Button } from "@/components/ui/button";
import {
  ManualSessionForm,
  type ManualSessionProgramOption,
} from "@/components/progress/manual-session-form";

export default async function AddManualSessionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [allExercises, programs, lastWeights] = await Promise.all([
    exerciseService.listForUser(session.user.id),
    programService.listFull(session.user.id),
    workoutService.getDefaultWeights(session.user.id),
  ]);

  const exerciseOptions = allExercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
  }));

  const defaultWeights = Object.fromEntries(lastWeights);

  const programOptions: ManualSessionProgramOption[] = programs.map((program) => ({
    id: program.id,
    name: program.name,
    days: program.days.map((day) => ({
      id: day.id,
      name: day.name,
      label: day.label,
      exercises: day.exercises.map((pde) => ({
        id: pde.id,
        exerciseId: pde.exerciseId,
        name: pde.exercise.name,
        muscleGroup: pde.exercise.muscleGroup,
        equipment: pde.exercise.equipment,
        targetSets: pde.targetSets,
        defaultWeight: pde.targetWeight ? Number(pde.targetWeight) : (lastWeights.get(pde.exerciseId) ?? null),
      })),
    })),
  }));

  return (
    <div className="space-y-6">
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
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Ajouter une séance passée</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pour une séance faite sans l&apos;application : choisis le programme suivi (ou une séance
          libre), renseigne la date, puis les séries déjà réalisées.
        </p>
      </div>

      <ManualSessionForm
        exercises={exerciseOptions}
        programs={programOptions}
        defaultWeights={defaultWeights}
      />
    </div>
  );
}
