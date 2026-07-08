import { exerciseRepository } from "@/server/repositories/exerciseRepository";
import { NotFoundError } from "@/server/errors";
import type { CreateExerciseInput } from "@/server/validators/exercise";

export class DuplicateExerciseError extends Error {
  constructor(name: string) {
    super(`Un exercice nommé "${name}" existe déjà.`);
    this.name = "DuplicateExerciseError";
  }
}

export class ExerciseInUseError extends Error {
  constructor() {
    super("Cet exercice est utilisé dans un programme ou une séance, il ne peut pas être supprimé.");
    this.name = "ExerciseInUseError";
  }
}

async function requireOwnedCustomExercise(id: string, userId: string) {
  const exercise = await exerciseRepository.findOwnedCustomById(id, userId);
  if (!exercise) throw new NotFoundError("Exercice introuvable.");
  return exercise;
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

  async updateCustom(userId: string, id: string, input: CreateExerciseInput) {
    await requireOwnedCustomExercise(id, userId);

    const duplicate = await exerciseRepository.findByNameForUser(userId, input.name);
    if (duplicate && duplicate.id !== id) {
      throw new DuplicateExerciseError(input.name);
    }

    return exerciseRepository.update(id, input);
  },

  async removeCustom(userId: string, id: string) {
    await requireOwnedCustomExercise(id, userId);

    const usageCount = await exerciseRepository.countUsage(id);
    if (usageCount > 0) {
      throw new ExerciseInUseError();
    }

    await exerciseRepository.delete(id);
  },
};
