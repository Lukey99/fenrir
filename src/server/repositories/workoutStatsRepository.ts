import { prisma } from "@/lib/prisma";

const activeStatuses = ["COMPLETED", "IN_PROGRESS"] as const;

const completedSetInclude = {
  sessionExercise: {
    select: {
      exerciseId: true,
      exercise: { select: { id: true, name: true, muscleGroup: true } },
      session: { select: { id: true, startedAt: true, status: true } },
    },
  },
} as const;

export const workoutStatsRepository = {
  /** Every logged (completed, non-warmup) set for a user, across all exercises. */
  findCompletedSetsForUser(userId: string) {
    return prisma.workoutSet.findMany({
      where: {
        completed: true,
        isWarmup: false,
        sessionExercise: { session: { userId, status: { in: [...activeStatuses] } } },
      },
      include: completedSetInclude,
    });
  },

  findCompletedSetsForExercise(userId: string, exerciseId: string) {
    return prisma.workoutSet.findMany({
      where: {
        completed: true,
        isWarmup: false,
        sessionExercise: {
          exerciseId,
          session: { userId, status: { in: [...activeStatuses] } },
        },
      },
      include: completedSetInclude,
    });
  },

  /** Most recently logged weight for this exercise, used to pre-fill new sets. */
  findLastCompletedSetForExercise(userId: string, exerciseId: string) {
    return prisma.workoutSet.findFirst({
      where: {
        completed: true,
        isWarmup: false,
        weight: { not: null },
        sessionExercise: { exerciseId, session: { userId } },
      },
      orderBy: { completedAt: "desc" },
      select: { weight: true },
    });
  },

  /** Most recently logged weight per exercise, across all of the user's exercises. */
  async findLastWeightPerExerciseForUser(userId: string): Promise<Map<string, number>> {
    const sets = await prisma.workoutSet.findMany({
      where: {
        completed: true,
        isWarmup: false,
        weight: { not: null },
        sessionExercise: { session: { userId } },
      },
      orderBy: { completedAt: "desc" },
      select: { weight: true, sessionExercise: { select: { exerciseId: true } } },
    });

    const byExercise = new Map<string, number>();
    for (const set of sets) {
      const exerciseId = set.sessionExercise.exerciseId;
      if (!byExercise.has(exerciseId)) {
        byExercise.set(exerciseId, Number(set.weight));
      }
    }
    return byExercise;
  },

  findSessionsForUser(userId: string) {
    return prisma.workoutSession.findMany({
      where: { userId, status: { in: [...activeStatuses] } },
      select: {
        id: true,
        startedAt: true,
        completedAt: true,
        status: true,
        programDay: { select: { name: true, label: true } },
        exercises: {
          select: {
            action: true,
            exercise: { select: { name: true } },
            sets: { where: { completed: true, isWarmup: false }, select: { weight: true, reps: true } },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });
  },
};
