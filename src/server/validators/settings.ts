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
  currentPassword: z.string().min(1, "Mot de passe actuel requis.").max(72, "Mot de passe invalide."),
  // bcrypt silently truncates and ignores anything past 72 bytes.
  newPassword: z.string().min(8, "8 caractères minimum.").max(72, "72 caractères maximum."),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
