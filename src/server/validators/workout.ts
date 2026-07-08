import { z } from "zod";

export const startSessionSchema = z.object({
  programDayId: z.string().optional(),
});
export type StartSessionInput = z.infer<typeof startSessionSchema>;

export const addSessionExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercice requis."),
  targetSets: z.number().int().min(1).max(20),
  targetRepsMin: z.number().int().min(1).max(100),
  targetRepsMax: z.number().int().min(1).max(100),
  restSeconds: z.number().int().min(0).max(1800).optional(),
  notes: z.string().trim().max(300).optional(),
  scope: z.enum(["session", "program"]),
});
export type AddSessionExerciseInput = z.infer<typeof addSessionExerciseSchema>;

export const swapSessionExerciseSchema = z.object({
  type: z.literal("swap"),
  exerciseId: z.string().min(1, "Exercice requis."),
  scope: z.enum(["session", "program"]).default("session"),
});

export const skipSessionExerciseSchema = z.object({
  type: z.literal("skip"),
  scope: z.enum(["session", "program"]).default("session"),
});

export const restoreSessionExerciseSchema = z.object({
  type: z.literal("restore"),
});

export const sessionExerciseActionSchema = z.discriminatedUnion("type", [
  swapSessionExerciseSchema,
  skipSessionExerciseSchema,
  restoreSessionExerciseSchema,
]);
export type SessionExerciseActionInput = z.infer<typeof sessionExerciseActionSchema>;

export const updateWorkoutSetSchema = z.object({
  weight: z.number().min(0).max(1000).nullable().optional(),
  reps: z.number().int().min(0).max(200).nullable().optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
  isWarmup: z.boolean().optional(),
  completed: z.boolean().optional(),
});
export type UpdateWorkoutSetInput = z.infer<typeof updateWorkoutSetSchema>;

const manualSetSchema = z.object({
  weight: z.number().min(0).max(1000).nullable().optional(),
  reps: z.number().int().min(0).max(200).nullable().optional(),
});

const manualSessionExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercice requis."),
  sourceProgramDayExerciseId: z.string().optional(),
  sets: z.array(manualSetSchema).min(1, "Ajoute au moins une série."),
});

export const createManualSessionSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")
    .refine(
      (value) => value <= new Date().toISOString().slice(0, 10),
      "La date ne peut pas être dans le futur."
    ),
  programDayId: z.string().optional(),
  notes: z.string().trim().max(300).optional(),
  exercises: z.array(manualSessionExerciseSchema).min(1, "Ajoute au moins un exercice."),
});
export type CreateManualSessionInput = z.infer<typeof createManualSessionSchema>;
