import { z } from "zod";

export const createPersonalRecordSchema = z.object({
  exerciseId: z.string().min(1, "Exercice requis."),
  weight: z.number().positive("Poids invalide.").max(1000, "Poids trop élevé."),
  reps: z.number().int("Reps invalides.").positive("Reps invalides.").max(100, "Trop de répétitions."),
  achievedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
});
export type CreatePersonalRecordInput = z.infer<typeof createPersonalRecordSchema>;
