import { prisma } from "@/lib/prisma";
import type { UpdateWorkoutSetInput } from "@/server/validators/workout";

const exerciseSelect = {
  select: { id: true, name: true, muscleGroup: true, equipment: true },
} as const;

const fullSessionInclude = {
  programDay: {
    select: {
      id: true,
      name: true,
      label: true,
      programId: true,
      program: { select: { name: true } },
    },
  },
  exercises: {
    orderBy: { order: "asc" as const },
    include: { exercise: exerciseSelect, sets: { orderBy: { setNumber: "asc" as const } } },
  },
};

export const workoutRepository = {
  findProgramDayForSnapshot(programDayId: string) {
    return prisma.programDay.findUnique({
      where: { id: programDayId },
      include: {
        program: { select: { userId: true } },
        exercises: { orderBy: { order: "asc" }, include: { exercise: exerciseSelect } },
      },
    });
  },

  createSession(
    userId: string,
    programDayId: string | null,
    sessionExercises: {
      order: number;
      exerciseId: string;
      sourceProgramDayExerciseId: string | null;
      targetSets: number;
      targetRepsMin: number;
      targetRepsMax: number;
      targetWeight: number | null;
      restSeconds: number | null;
      notes: string | null;
      supersetGroup: number | null;
      defaultWeight: number | null;
    }[]
  ) {
    return prisma.workoutSession.create({
      data: {
        userId,
        programDayId,
        exercises: {
          create: sessionExercises.map((se) => ({
            order: se.order,
            exerciseId: se.exerciseId,
            sourceProgramDayExerciseId: se.sourceProgramDayExerciseId,
            targetSets: se.targetSets,
            targetRepsMin: se.targetRepsMin,
            targetRepsMax: se.targetRepsMax,
            targetWeight: se.targetWeight,
            restSeconds: se.restSeconds,
            notes: se.notes,
            supersetGroup: se.supersetGroup,
            sets: {
              create: Array.from({ length: se.targetSets }, (_, i) => ({
                setNumber: i + 1,
                weight: se.defaultWeight,
              })),
            },
          })),
        },
      },
      include: fullSessionInclude,
    });
  },

  findFullSessionForUser(id: string, userId: string) {
    return prisma.workoutSession.findFirst({
      where: { id, userId },
      include: fullSessionInclude,
    });
  },

  findSessionForUser(id: string, userId: string) {
    return prisma.workoutSession.findFirst({ where: { id, userId } });
  },

  completeSession(id: string) {
    return prisma.workoutSession.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  },

  deleteSession(id: string) {
    return prisma.workoutSession.delete({ where: { id } });
  },

  /** Backfills a session that was actually performed outside the app (already completed). */
  createManualSession(
    userId: string,
    programDayId: string | null,
    startedAt: Date,
    notes: string | null,
    exercises: {
      order: number;
      exerciseId: string;
      sourceProgramDayExerciseId: string | null;
      targetSets: number;
      targetRepsMin: number;
      targetRepsMax: number;
      targetWeight: number | null;
      sets: { setNumber: number; weight: number | null; reps: number | null }[];
    }[]
  ) {
    return prisma.workoutSession.create({
      data: {
        userId,
        programDayId,
        status: "COMPLETED",
        startedAt,
        completedAt: startedAt,
        isManual: true,
        notes,
        exercises: {
          create: exercises.map((ex) => ({
            order: ex.order,
            exerciseId: ex.exerciseId,
            sourceProgramDayExerciseId: ex.sourceProgramDayExerciseId,
            targetSets: ex.targetSets,
            targetRepsMin: ex.targetRepsMin,
            targetRepsMax: ex.targetRepsMax,
            targetWeight: ex.targetWeight,
            sets: {
              create: ex.sets.map((s) => ({
                setNumber: s.setNumber,
                weight: s.weight,
                reps: s.reps,
                completed: true,
                completedAt: startedAt,
              })),
            },
          })),
        },
      },
      include: fullSessionInclude,
    });
  },

  // -- Session exercises ---------------------------------------------------

  findSessionExerciseWithSession(id: string) {
    return prisma.sessionExercise.findUnique({
      where: { id },
      include: { session: { select: { id: true, userId: true, programDayId: true } } },
    });
  },

  async addExercise(
    sessionId: string,
    data: {
      exerciseId: string;
      targetSets: number;
      targetRepsMin: number;
      targetRepsMax: number;
      restSeconds: number | null;
      notes: string | null;
      defaultWeight: number | null;
    }
  ) {
    const last = await prisma.sessionExercise.findFirst({
      where: { sessionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return prisma.sessionExercise.create({
      data: {
        sessionId,
        order: (last?.order ?? -1) + 1,
        action: "ADDED",
        exerciseId: data.exerciseId,
        targetSets: data.targetSets,
        targetRepsMin: data.targetRepsMin,
        targetRepsMax: data.targetRepsMax,
        restSeconds: data.restSeconds,
        notes: data.notes,
        sets: {
          create: Array.from({ length: data.targetSets }, (_, i) => ({
            setNumber: i + 1,
            weight: data.defaultWeight,
          })),
        },
      },
      include: { exercise: exerciseSelect, sets: { orderBy: { setNumber: "asc" } } },
    });
  },

  async swapExercise(id: string, exerciseId: string, targetSets: number, defaultWeight: number | null) {
    await prisma.workoutSet.deleteMany({ where: { sessionExerciseId: id } });
    return prisma.sessionExercise.update({
      where: { id },
      data: {
        exerciseId,
        action: "SWAPPED",
        sets: {
          create: Array.from({ length: targetSets }, (_, i) => ({
            setNumber: i + 1,
            weight: defaultWeight,
          })),
        },
      },
      include: { exercise: exerciseSelect, sets: { orderBy: { setNumber: "asc" } } },
    });
  },

  setAction(id: string, action: "SKIPPED" | "ORIGINAL") {
    return prisma.sessionExercise.update({
      where: { id },
      data: { action },
      include: { exercise: exerciseSelect, sets: { orderBy: { setNumber: "asc" } } },
    });
  },

  // -- Sets -----------------------------------------------------------------

  findSetWithSession(id: string) {
    return prisma.workoutSet.findUnique({
      where: { id },
      include: {
        sessionExercise: {
          include: {
            session: { select: { id: true, userId: true } },
            exercise: { select: { id: true, name: true } },
          },
        },
      },
    });
  },

  /** Most recent set (in this exercise, this session) that has a weight logged. */
  findLastWeightedSetInSessionExercise(sessionExerciseId: string) {
    return prisma.workoutSet.findFirst({
      where: { sessionExerciseId, weight: { not: null } },
      orderBy: { setNumber: "desc" },
      select: { weight: true },
    });
  },

  async addSet(sessionExerciseId: string, defaultWeight: number | null) {
    const last = await prisma.workoutSet.findFirst({
      where: { sessionExerciseId },
      orderBy: { setNumber: "desc" },
      select: { setNumber: true },
    });
    return prisma.workoutSet.create({
      data: { sessionExerciseId, setNumber: (last?.setNumber ?? 0) + 1, weight: defaultWeight },
    });
  },

  updateSet(id: string, data: UpdateWorkoutSetInput) {
    const { completed, ...rest } = data;
    return prisma.workoutSet.update({
      where: { id },
      data: {
        ...rest,
        ...(completed !== undefined
          ? { completed, completedAt: completed ? new Date() : null }
          : {}),
      },
    });
  },

  deleteSet(id: string) {
    return prisma.workoutSet.delete({ where: { id } });
  },
};
