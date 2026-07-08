import { z } from "zod";
import { muscleGroupOrder } from "@/lib/constants";

export const createExerciseSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(80),
  muscleGroup: z.enum(muscleGroupOrder, { error: "Groupe musculaire invalide." }),
  equipment: z.string().trim().max(60).optional(),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
