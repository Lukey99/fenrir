import { prisma } from "@/lib/prisma";
import type { CreateExerciseInput } from "@/server/validators/exercise";

export const exerciseRepository = {
  findAllVisibleToUser(userId: string) {
    return prisma.exercise.findMany({
      where: { OR: [{ userId: null }, { userId }] },
      orderBy: { name: "asc" },
    });
  },

  create(userId: string, data: CreateExerciseInput) {
    return prisma.exercise.create({
      data: {
        name: data.name,
        muscleGroup: data.muscleGroup,
        equipment: data.equipment || null,
        isCustom: true,
        userId,
      },
    });
  },

  findByNameForUser(userId: string, name: string) {
    return prisma.exercise.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        OR: [{ userId: null }, { userId }],
      },
    });
  },

  findVisibleById(id: string, userId: string) {
    return prisma.exercise.findFirst({
      where: { id, OR: [{ userId: null }, { userId }] },
    });
  },

  /** Only a user's own custom exercises are editable/deletable — never the shared built-ins. */
  findOwnedCustomById(id: string, userId: string) {
    return prisma.exercise.findFirst({
      where: { id, userId, isCustom: true },
    });
  },

  update(id: string, data: CreateExerciseInput) {
    return prisma.exercise.update({
      where: { id },
      data: {
        name: data.name,
        muscleGroup: data.muscleGroup,
        equipment: data.equipment || null,
      },
    });
  },

  delete(id: string) {
    return prisma.exercise.delete({ where: { id } });
  },

  /** Programs/sessions reference exercises with a required FK — check before deleting. */
  async countUsage(id: string) {
    const [programCount, sessionCount] = await Promise.all([
      prisma.programDayExercise.count({ where: { exerciseId: id } }),
      prisma.sessionExercise.count({ where: { exerciseId: id } }),
    ]);
    return programCount + sessionCount;
  },
};
