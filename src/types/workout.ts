import type { MuscleGroupValue } from "@/lib/constants";

// Plain client-facing shapes matching the JSON the API actually returns
// (Prisma's Decimal/Date fields serialize to strings over the wire).

export type WorkoutSetDTO = {
  id: string;
  setNumber: number;
  weight: string | null;
  reps: number | null;
  rpe: string | null;
  notes: string | null;
  isWarmup: boolean;
  completed: boolean;
  completedAt: string | null;
};

export type SessionExerciseAction = "ORIGINAL" | "SWAPPED" | "ADDED" | "SKIPPED";

export type SessionExerciseDTO = {
  id: string;
  order: number;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    muscleGroup: MuscleGroupValue;
    equipment: string | null;
  };
  sourceProgramDayExerciseId: string | null;
  action: SessionExerciseAction;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeight: string | null;
  restSeconds: number | null;
  notes: string | null;
  sets: WorkoutSetDTO[];
};

export type WorkoutSessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type WorkoutSessionDTO = {
  id: string;
  programDayId: string | null;
  programDay: { id: string; name: string; label: string | null; programId: string } | null;
  status: WorkoutSessionStatus;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  exercises: SessionExerciseDTO[];
};
