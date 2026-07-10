import type { MuscleCategoryValue } from "@/lib/constants";
import type { MuscleGroupValue } from "@/lib/constants";

export type PersonalRecordCategoryExercise = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroupValue;
  bestWeight: number;
  bestReps: number;
  bestDate: string;
  recordsCount: number;
};

export type PersonalRecordCategory = {
  category: MuscleCategoryValue;
  exercises: PersonalRecordCategoryExercise[];
};

export type PersonalRecordsOverview = {
  categories: PersonalRecordCategory[];
  hasAnyRecords: boolean;
};

export type PersonalRecordEntry = {
  id: string;
  weight: number;
  reps: number;
  achievedAt: string;
  estimated1RM: number;
};

export type PersonalRecordExerciseProgression = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroupValue;
  records: PersonalRecordEntry[];
};
