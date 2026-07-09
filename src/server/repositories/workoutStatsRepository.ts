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

const completedSetIncludeWithProgram = {
  sessionExercise: {
    select: {
      exerciseId: true,
      exercise: { select: { id: true, name: true, muscleGroup: true } },
      session: {
        select: {
          id: true,
          startedAt: true,
          completedAt: true,
          programDay: {
            select: {
              id: true,
              name: true,
              label: true,
              program: { select: { id: true, name: true } },
            },
          },
        },
      },
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

  /** Same as findCompletedSetsForUser, but with the source program/day attached —
   * used to group progress by program (or "séances libres" when there's none). */
  findCompletedSetsWithProgramForUser(userId: string) {
    return prisma.workoutSet.findMany({
      where: {
        completed: true,
        isWarmup: false,
        sessionExercise: { session: { userId, status: { in: [...activeStatuses] } } },
      },
      include: completedSetIncludeWithProgram,
    });
  },

  /** `since` pushes the range filter (week/month/year) down to the DB instead
   * of fetching the exercise's entire history and filtering it in JS. */
  findCompletedSetsForExercise(userId: string, exerciseId: string, since?: Date) {
    return prisma.workoutSet.findMany({
      where: {
        completed: true,
        isWarmup: false,
        sessionExercise: {
          exerciseId,
          session: {
            userId,
            status: { in: [...activeStatuses] },
            ...(since ? { startedAt: { gte: since } } : {}),
          },
        },
      },
      include: completedSetInclude,
    });
  },

  /** Cheap existence + name lookup — has this user ever completed a set for this
   * exercise at all? Used to tell "never trained" apart from "trained, but not
   * within the selected range" without fetching the exercise's full history. */
  findAnyCompletedSetForExercise(userId: string, exerciseId: string) {
    return prisma.workoutSet.findFirst({
      where: {
        completed: true,
        isWarmup: false,
        sessionExercise: { exerciseId, session: { userId, status: { in: [...activeStatuses] } } },
      },
      select: {
        sessionExercise: { select: { exercise: { select: { id: true, name: true, muscleGroup: true } } } },
      },
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

  countCompletedSessionsForUser(userId: string) {
    return prisma.workoutSession.count({ where: { userId, status: "COMPLETED" } });
  },

  /** Session summaries since a given date — used to build the dashboard's activity strip
   * (day-by-day trained/not, plus a per-session breakdown for the hover popover). */
  findSessionSummariesSince(userId: string, since: Date) {
    return prisma.workoutSession.findMany({
      where: { userId, status: { in: [...activeStatuses] }, startedAt: { gte: since } },
      select: {
        id: true,
        startedAt: true,
        programDay: { select: { name: true } },
        exercises: {
          select: {
            action: true,
            exercise: { select: { name: true } },
            sets: {
              where: { completed: true, isWarmup: false },
              select: { weight: true, reps: true },
            },
          },
        },
      },
      orderBy: { startedAt: "asc" },
    });
  },
};
