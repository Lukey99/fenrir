import { prisma } from "@/lib/prisma";

type MeasurementFields = {
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  armCm?: number;
  thighCm?: number;
  calfCm?: number;
};

export const bodyMeasurementRepository = {
  listEntriesForUser(userId: string) {
    return prisma.bodyMeasurementEntry.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
  },

  findEntry(id: string) {
    return prisma.bodyMeasurementEntry.findUnique({ where: { id } });
  },

  upsertEntry(userId: string, date: Date, fields: MeasurementFields, note: string | undefined) {
    return prisma.bodyMeasurementEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...fields, note },
      update: { ...fields, note },
    });
  },

  deleteEntry(id: string) {
    return prisma.bodyMeasurementEntry.delete({ where: { id } });
  },
};
