import { z } from "zod";

export const logBodyWeightEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  weight: z.number().min(20, "Poids trop faible.").max(400, "Poids trop élevé."),
  note: z.string().trim().max(300).optional(),
});
export type LogBodyWeightEntryInput = z.infer<typeof logBodyWeightEntrySchema>;

export const setWeightGoalSchema = z.object({
  targetWeight: z.number().min(20, "Poids trop faible.").max(400, "Poids trop élevé."),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")
    .optional(),
});
export type SetWeightGoalInput = z.infer<typeof setWeightGoalSchema>;

export const setHeightSchema = z.object({
  heightCm: z.number().int().min(100, "Taille trop faible.").max(250, "Taille trop élevée."),
});
export type SetHeightInput = z.infer<typeof setHeightSchema>;
