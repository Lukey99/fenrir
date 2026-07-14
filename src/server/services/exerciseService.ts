import { exerciseRepository } from "@/server/repositories/exerciseRepository";
import { NotFoundError } from "@/server/errors";
import { Prisma } from "@/generated/prisma/client";
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
    // The check above is a fast-path, not a guarantee — two concurrent requests
    // for the same name can both pass it before either commits. The @@unique
    // constraint on (userId, name) is the real guard; translate its violation
    // into the same domain error instead of letting a raw P2002 leak out.
    try {
      return await exerciseRepository.create(userId, input);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateExerciseError(input.name);
      }
      throw error;
    }
  },

  async updateCustom(userId: string, id: string, input: CreateExerciseInput) {
    await requireOwnedCustomExercise(id, userId);

    const duplicate = await exerciseRepository.findByNameForUser(userId, input.name);
    if (duplicate && duplicate.id !== id) {
      throw new DuplicateExerciseError(input.name);
    }

    try {
      return await exerciseRepository.update(id, input);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateExerciseError(input.name);
      }
      throw error;
    }
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
