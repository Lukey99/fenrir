import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(80),
  description: z.string().trim().max(500).optional(),
});
export type CreateProgramInput = z.infer<typeof createProgramSchema>;

export const updateProgramSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(80).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

export const createProgramDaySchema = z.object({
  name: z.string().trim().min(1, "Le nom du jour est requis.").max(60),
  label: z.string().trim().max(40).optional(),
});
export type CreateProgramDayInput = z.infer<typeof createProgramDaySchema>;

export const updateProgramDaySchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  label: z.string().trim().max(40).optional(),
  order: z.number().int().min(0).optional(),
});
export type UpdateProgramDayInput = z.infer<typeof updateProgramDaySchema>;

export const createProgramDayExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercice requis."),
  targetSets: z.number().int().min(1).max(20),
  targetRepsMin: z.number().int().min(1).max(100),
  targetRepsMax: z.number().int().min(1).max(100),
  targetWeight: z.number().min(0).max(1000).optional(),
  restSeconds: z.number().int().min(0).max(1800).optional(),
  notes: z.string().trim().max(300).optional(),
});
export type CreateProgramDayExerciseInput = z.infer<typeof createProgramDayExerciseSchema>;

export const updateProgramDayExerciseSchema = z.object({
  targetSets: z.number().int().min(1).max(20).optional(),
  targetRepsMin: z.number().int().min(1).max(100).optional(),
  targetRepsMax: z.number().int().min(1).max(100).optional(),
  targetWeight: z.number().min(0).max(1000).nullable().optional(),
  restSeconds: z.number().int().min(0).max(1800).nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
  order: z.number().int().min(0).optional(),
});
export type UpdateProgramDayExerciseInput = z.infer<typeof updateProgramDayExerciseSchema>;
