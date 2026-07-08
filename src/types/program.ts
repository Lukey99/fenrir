import type { MuscleGroupValue } from "@/lib/constants";

// Plain client-facing shapes matching the JSON the API actually returns
// (Prisma's Decimal fields serialize to strings over the wire).

export type ProgramDayExerciseDTO = {
  id: string;
  order: number;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    muscleGroup: MuscleGroupValue;
    equipment: string | null;
  };
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeight: string | null;
  restSeconds: number | null;
  notes: string | null;
};

export type ProgramDayDTO = {
  id: string;
  order: number;
  name: string;
  label: string | null;
  exercises: ProgramDayExerciseDTO[];
};

export type ProgramDetailDTO = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  days: ProgramDayDTO[];
};
