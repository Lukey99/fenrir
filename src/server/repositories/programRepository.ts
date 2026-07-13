import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type {
  CreateProgramInput,
  UpdateProgramInput,
  CreateProgramDayInput,
  UpdateProgramDayInput,
  CreateProgramDayExerciseInput,
  UpdateProgramDayExerciseInput,
} from "@/server/validators/program";

const dayExerciseInclude = {
  exercise: { select: { id: true, name: true, muscleGroup: true, equipment: true } },
} as const;

const fullProgramInclude = {
  days: {
    orderBy: { order: "asc" as const },
    include: { exercises: { orderBy: { order: "asc" as const }, include: dayExerciseInclude } },
  },
};

type FullProgram = Prisma.ProgramGetPayload<{ include: typeof fullProgramInclude }>;

export const programRepository = {
  findAllForUser(userId: string) {
    return prisma.program.findMany({
      where: { userId },
      include: { _count: { select: { days: true } } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
  },

  findFullByIdForUser(id: string, userId: string) {
    return prisma.program.findFirst({
      where: { id, userId },
      include: fullProgramInclude,
    });
  },

  findAllFullForUser(userId: string) {
    return prisma.program.findMany({
      where: { userId },
      include: fullProgramInclude,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.program.findFirst({ where: { id, userId } });
  },

  create(userId: string, data: CreateProgramInput) {
    return prisma.program.create({
      data: { userId, name: data.name, description: data.description },
    });
  },

  update(id: string, data: UpdateProgramInput) {
    return prisma.program.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.program.delete({ where: { id } });
  },

  async duplicate(program: FullProgram) {
    return prisma.program.create({
      data: {
        userId: program.userId,
        name: `${program.name} (copie)`,
        description: program.description,
        status: "ACTIVE",
        days: {
          create: program.days.map((day) => ({
            order: day.order,
            name: day.name,
            label: day.label,
            preferredWeekdays: day.preferredWeekdays,
            exercises: {
              create: day.exercises.map((exercise) => ({
                order: exercise.order,
                exerciseId: exercise.exerciseId,
                targetSets: exercise.targetSets,
                targetRepsMin: exercise.targetRepsMin,
                targetRepsMax: exercise.targetRepsMax,
                targetWeight: exercise.targetWeight,
                restSeconds: exercise.restSeconds,
                notes: exercise.notes,
              })),
            },
          })),
        },
      },
      include: fullProgramInclude,
    });
  },

  // -- Days --------------------------------------------------------------

  findDayWithProgram(dayId: string) {
    return prisma.programDay.findUnique({
      where: { id: dayId },
      include: { program: { select: { userId: true } } },
    });
  },

  async createDay(programId: string, data: CreateProgramDayInput) {
    const last = await prisma.programDay.findFirst({
      where: { programId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return prisma.programDay.create({
      data: {
        programId,
        order: (last?.order ?? -1) + 1,
        name: data.name,
        label: data.label,
        preferredWeekdays: data.preferredWeekdays ?? [],
      },
    });
  },

  updateDay(dayId: string, data: UpdateProgramDayInput) {
    return prisma.programDay.update({ where: { id: dayId }, data });
  },

  /** Program days (across the user's active programs) usually trained on this weekday. */
  findTodaysSuggestedDaysForUser(userId: string, weekday: number) {
    return prisma.programDay.findMany({
      where: { preferredWeekdays: { has: weekday }, program: { userId, status: "ACTIVE" } },
      select: {
        id: true,
        name: true,
        label: true,
        program: { select: { id: true, name: true } },
      },
      orderBy: { order: "asc" },
    });
  },

  deleteDay(dayId: string) {
    return prisma.programDay.delete({ where: { id: dayId } });
  },

  // -- Day exercises -------------------------------------------------------

  findDayExerciseWithProgram(id: string) {
    return prisma.programDayExercise.findUnique({
      where: { id },
      include: { programDay: { include: { program: { select: { userId: true } } } } },
    });
  },

  async createDayExercise(programDayId: string, data: CreateProgramDayExerciseInput) {
    const last = await prisma.programDayExercise.findFirst({
      where: { programDayId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return prisma.programDayExercise.create({
      data: {
        programDayId,
        order: (last?.order ?? -1) + 1,
        exerciseId: data.exerciseId,
        targetSets: data.targetSets,
        targetRepsMin: data.targetRepsMin,
        targetRepsMax: data.targetRepsMax,
        targetWeight: data.targetWeight,
        restSeconds: data.restSeconds,
        notes: data.notes,
      },
      include: dayExerciseInclude,
    });
  },

  updateDayExercise(id: string, data: UpdateProgramDayExerciseInput) {
    return prisma.programDayExercise.update({
      where: { id },
      data,
      include: dayExerciseInclude,
    });
  },

  /** Used when a workout-session swap is applied back to the program template. */
  updateDayExerciseSource(id: string, exerciseId: string) {
    return prisma.programDayExercise.update({
      where: { id },
      data: { exerciseId },
      include: dayExerciseInclude,
    });
  },

  deleteDayExercise(id: string) {
    return prisma.programDayExercise.delete({ where: { id } });
  },
};
