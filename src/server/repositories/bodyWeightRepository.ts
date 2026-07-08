import { prisma } from "@/lib/prisma";

export const bodyWeightRepository = {
  listEntriesForUser(userId: string) {
    return prisma.bodyWeightEntry.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
  },

  findLatestForUser(userId: string) {
    return prisma.bodyWeightEntry.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });
  },

  findEntry(id: string) {
    return prisma.bodyWeightEntry.findUnique({ where: { id } });
  },

  upsertEntry(userId: string, date: Date, weight: number, note: string | undefined) {
    return prisma.bodyWeightEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, weight, note },
      update: { weight, note },
    });
  },

  deleteEntry(id: string) {
    return prisma.bodyWeightEntry.delete({ where: { id } });
  },

  findLatestGoal(userId: string) {
    return prisma.weightGoal.findFirst({
      where: { userId, achievedAt: null },
      orderBy: { createdAt: "desc" },
    });
  },

  createGoal(userId: string, targetWeight: number, targetDate: Date | null) {
    return prisma.weightGoal.create({ data: { userId, targetWeight, targetDate } });
  },

  updateGoal(id: string, targetWeight: number, targetDate: Date | null) {
    return prisma.weightGoal.update({ where: { id }, data: { targetWeight, targetDate } });
  },

  findUserHeight(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { heightCm: true } });
  },

  updateUserHeight(userId: string, heightCm: number) {
    return prisma.user.update({ where: { id: userId }, data: { heightCm } });
  },
};
