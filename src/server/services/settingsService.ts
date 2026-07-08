import bcrypt from "bcryptjs";

import { userRepository } from "@/server/repositories/userRepository";
import { NotFoundError } from "@/server/errors";

export class InvalidPasswordError extends Error {
  constructor() {
    super("Mot de passe actuel incorrect.");
    this.name = "InvalidPasswordError";
  }
}

export const settingsService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Utilisateur introuvable.");
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      unitPreference: user.unitPreference,
      heightCm: user.heightCm,
    };
  },

  async updateName(userId: string, name: string) {
    await userRepository.updateName(userId, name);
  },

  async updateUnitPreference(userId: string, unitPreference: "KG" | "LBS") {
    await userRepository.updateUnitPreference(userId, unitPreference);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user?.passwordHash) throw new NotFoundError("Utilisateur introuvable.");

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new InvalidPasswordError();

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePasswordHash(userId, passwordHash);
  },
};
