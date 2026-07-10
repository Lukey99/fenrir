import { prisma } from "@/lib/prisma";

export const personalRecordRepository = {
  create(
    userId: string,
    data: { exerciseId: string; weight: number; reps: number; achievedAt: Date }
  ) {
    return prisma.personalRecord.create({
      data: { userId, ...data },
    });
  },

  findById(id: string) {
    return prisma.personalRecord.findUnique({ where: { id } });
  },

  findAllForUser(userId: string) {
    return prisma.personalRecord.findMany({
      where: { userId },
      select: {
        id: true,
        weight: true,
        reps: true,
        achievedAt: true,
        exercise: { select: { id: true, name: true, muscleGroup: true } },
      },
      orderBy: { achievedAt: "asc" },
    });
  },

  /** Most recently logged records across all exercises — used by the dashboard's
   * "Records récents" widget. */
  findRecentForUser(userId: string, limit: number) {
    return prisma.personalRecord.findMany({
      where: { userId },
      select: {
        weight: true,
        reps: true,
        achievedAt: true,
        exercise: { select: { id: true, name: true } },
      },
      orderBy: { achievedAt: "desc" },
      take: limit,
    });
  },

  findForExercise(userId: string, exerciseId: string) {
    return prisma.personalRecord.findMany({
      where: { userId, exerciseId },
      select: { id: true, weight: true, reps: true, achievedAt: true },
      orderBy: { achievedAt: "asc" },
    });
  },

  delete(id: string) {
    return prisma.personalRecord.delete({ where: { id } });
  },
};
