import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(80),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePreferencesSchema = z.object({
  unitPreference: z.enum(["KG", "LBS"]),
});
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis."),
  newPassword: z.string().min(8, "8 caractères minimum."),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
