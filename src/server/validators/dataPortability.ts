import { z } from "zod";

const muscleGroupSchema = z.enum([
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "FOREARMS",
  "QUADRICEPS",
  "HAMSTRINGS",
  "GLUTES",
  "CALVES",
  "CORE",
]);

const exerciseRefSchema = z.object({
  name: z.string().min(1),
  muscleGroup: muscleGroupSchema,
});

const dayExerciseSchema = z.object({
  order: z.number().int(),
  exercise: exerciseRefSchema,
  targetSets: z.number().int(),
  targetRepsMin: z.number().int(),
  targetRepsMax: z.number().int(),
  targetWeight: z.number().nullable().optional(),
  restSeconds: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const programSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  days: z.array(
    z.object({
      order: z.number().int(),
      name: z.string().min(1),
      label: z.string().nullable().optional(),
      exercises: z.array(dayExerciseSchema),
    })
  ),
});

const setSchema = z.object({
  setNumber: z.number().int(),
  weight: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  rpe: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  isWarmup: z.boolean().optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().nullable().optional(),
});

const sessionExerciseSchema = z.object({
  order: z.number().int(),
  exercise: exerciseRefSchema,
  targetSets: z.number().int(),
  targetRepsMin: z.number().int(),
  targetRepsMax: z.number().int(),
  targetWeight: z.number().nullable().optional(),
  restSeconds: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(setSchema),
});

const workoutSessionSchema = z.object({
  startedAt: z.string(),
  completedAt: z.string().nullable().optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ABANDONED"]).optional(),
  notes: z.string().nullable().optional(),
  exercises: z.array(sessionExerciseSchema),
});

export const exportDataSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  profile: z.object({
    unitPreference: z.enum(["KG", "LBS"]).optional(),
    heightCm: z.number().nullable().optional(),
  }),
  exercises: z.array(exerciseRefSchema.extend({ equipment: z.string().nullable().optional() })),
  programs: z.array(programSchema),
  workoutSessions: z.array(workoutSessionSchema),
  bodyWeightEntries: z.array(
    z.object({
      date: z.string(),
      weight: z.number(),
      note: z.string().nullable().optional(),
    })
  ),
  weightGoals: z.array(
    z.object({
      targetWeight: z.number(),
      targetDate: z.string().nullable().optional(),
      achievedAt: z.string().nullable().optional(),
    })
  ),
});
export type ExportData = z.infer<typeof exportDataSchema>;
