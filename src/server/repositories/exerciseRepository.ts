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
};
