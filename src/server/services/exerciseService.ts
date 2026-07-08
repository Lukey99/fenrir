import { exerciseRepository } from "@/server/repositories/exerciseRepository";
import type { CreateExerciseInput } from "@/server/validators/exercise";

export class DuplicateExerciseError extends Error {
  constructor(name: string) {
    super(`Un exercice nommé "${name}" existe déjà.`);
    this.name = "DuplicateExerciseError";
  }
}

export const exerciseService = {
  listForUser(userId: string) {
    return exerciseRepository.findAllVisibleToUser(userId);
  },

  async createCustom(userId: string, input: CreateExerciseInput) {
    const existing = await exerciseRepository.findByNameForUser(userId, input.name);
    if (existing) {
      throw new DuplicateExerciseError(input.name);
    }
    return exerciseRepository.create(userId, input);
  },
};
