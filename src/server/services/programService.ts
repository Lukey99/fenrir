import { programRepository } from "@/server/repositories/programRepository";
import { exerciseRepository } from "@/server/repositories/exerciseRepository";
import { NotFoundError } from "@/server/errors";
import type {
  CreateProgramInput,
  UpdateProgramInput,
  CreateProgramDayInput,
  UpdateProgramDayInput,
  CreateProgramDayExerciseInput,
  UpdateProgramDayExerciseInput,
} from "@/server/validators/program";

async function requireOwnedProgram(id: string, userId: string) {
  const program = await programRepository.findFullByIdForUser(id, userId);
  if (!program) throw new NotFoundError("Programme introuvable.");
  return program;
}

async function requireOwnedDay(dayId: string, userId: string) {
  const day = await programRepository.findDayWithProgram(dayId);
  if (!day || day.program.userId !== userId) {
    throw new NotFoundError("Jour introuvable.");
  }
  return day;
}

async function requireOwnedDayExercise(id: string, userId: string) {
  const dayExercise = await programRepository.findDayExerciseWithProgram(id);
  if (!dayExercise || dayExercise.programDay.program.userId !== userId) {
    throw new NotFoundError("Exercice de programme introuvable.");
  }
  return dayExercise;
}

export const programService = {
  list(userId: string) {
    return programRepository.findAllForUser(userId);
  },

  listFull(userId: string) {
    return programRepository.findAllFullForUser(userId);
  },

  get(id: string, userId: string) {
    return requireOwnedProgram(id, userId);
  },

  create(userId: string, input: CreateProgramInput) {
    return programRepository.create(userId, input);
  },

  async update(id: string, userId: string, input: UpdateProgramInput) {
    await requireOwnedProgram(id, userId);
    return programRepository.update(id, input);
  },

  async remove(id: string, userId: string) {
    await requireOwnedProgram(id, userId);
    await programRepository.delete(id);
  },

  async duplicate(id: string, userId: string) {
    const program = await requireOwnedProgram(id, userId);
    return programRepository.duplicate(program);
  },

  async addDay(programId: string, userId: string, input: CreateProgramDayInput) {
    await requireOwnedProgram(programId, userId);
    return programRepository.createDay(programId, input);
  },

  async updateDay(dayId: string, userId: string, input: UpdateProgramDayInput) {
    await requireOwnedDay(dayId, userId);
    return programRepository.updateDay(dayId, input);
  },

  async removeDay(dayId: string, userId: string) {
    await requireOwnedDay(dayId, userId);
    await programRepository.deleteDay(dayId);
  },

  async addDayExercise(dayId: string, userId: string, input: CreateProgramDayExerciseInput) {
    await requireOwnedDay(dayId, userId);
    const exercise = await exerciseRepository.findVisibleById(input.exerciseId, userId);
    if (!exercise) throw new NotFoundError("Exercice introuvable.");
    return programRepository.createDayExercise(dayId, input);
  },

  async updateDayExercise(id: string, userId: string, input: UpdateProgramDayExerciseInput) {
    await requireOwnedDayExercise(id, userId);
    return programRepository.updateDayExercise(id, input);
  },

  async removeDayExercise(id: string, userId: string) {
    await requireOwnedDayExercise(id, userId);
    await programRepository.deleteDayExercise(id);
  },
};
