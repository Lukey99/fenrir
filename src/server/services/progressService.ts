import { workoutStatsRepository } from "@/server/repositories/workoutStatsRepository";
import { estimate1RM, dateKey, daysAgo, trendSlope } from "@/server/services/analytics";
import type { MuscleGroupValue } from "@/lib/constants";

export type ProgressRange = "week" | "month" | "year" | "all";

const rangeDays: Record<ProgressRange, number | null> = {
  week: 7,
  month: 30,
  year: 365,
  all: null,
};

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

/** Sentinel id (not a real cuid) for sessions with no linked program day. */
export const FREE_SESSIONS_ID = "free";

export const progressService = {
  /** Level 1 of the progress funnel: one card per program the user has actually trained,
   * plus a "Séances libres" entry for sessions done outside any program. */
  async listPrograms(userId: string) {
    const sets = await workoutStatsRepository.findCompletedSetsWithProgramForUser(userId);

    const byProgram = new Map<
      string,
      {
        id: string;
        programId: string | null;
        name: string;
        sessionIds: Set<string>;
        exerciseIds: Set<string>;
        lastTrainedAt: Date;
      }
    >();

    for (const set of sets) {
      const { exerciseId, session } = set.sessionExercise;
      const program = session.programDay?.program ?? null;
      const key = program?.id ?? FREE_SESSIONS_ID;
      const trainedAt = session.completedAt ?? session.startedAt;

      const existing = byProgram.get(key);
      if (!existing) {
        byProgram.set(key, {
          id: key,
          programId: program?.id ?? null,
          name: program?.name ?? "Séances libres",
          sessionIds: new Set([session.id]),
          exerciseIds: new Set([exerciseId]),
          lastTrainedAt: trainedAt,
        });
      } else {
        existing.sessionIds.add(session.id);
        existing.exerciseIds.add(exerciseId);
        if (trainedAt > existing.lastTrainedAt) existing.lastTrainedAt = trainedAt;
      }
    }

    return Array.from(byProgram.values())
      .map((p) => ({
        id: p.id,
        name: p.name,
        sessionsCount: p.sessionIds.size,
        exercisesCount: p.exerciseIds.size,
        lastTrainedAt: p.lastTrainedAt,
      }))
      .sort((a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime());
  },

  /** Level 2 of the progress funnel: sessions and exercises trained under one program
   * (or under `FREE_SESSIONS_ID` for sessions with no linked program). */
  async getProgramDetail(userId: string, programKey: string) {
    const sets = await workoutStatsRepository.findCompletedSetsWithProgramForUser(userId);

    const isFree = programKey === FREE_SESSIONS_ID;
    const relevant = sets.filter((set) => {
      const programId = set.sessionExercise.session.programDay?.program?.id ?? null;
      return isFree ? programId === null : programId === programKey;
    });
    if (relevant.length === 0) return null;

    const programName = isFree
      ? "Séances libres"
      : relevant[0].sessionExercise.session.programDay!.program!.name;

    const byDayType = new Map<
      string,
      {
        dayName: string | null;
        sessionIds: Set<string>;
        lastTrainedAt: Date;
        lastSessionId: string;
      }
    >();
    const byExercise = new Map<
      string,
      {
        exerciseId: string;
        name: string;
        muscleGroup: MuscleGroupValue;
        lastTrainedAt: Date;
        sessionIds: Set<string>;
        best1RM: number;
      }
    >();

    for (const set of relevant) {
      const { exerciseId, exercise, session } = set.sessionExercise;
      const weight = toNumber(set.weight);
      const reps = set.reps ?? 0;
      const oneRm = estimate1RM(weight, reps);
      const trainedAt = session.completedAt ?? session.startedAt;
      const dayName = session.programDay?.name ?? null;
      const dayTypeKey = dayName ?? "__free__";

      const dayTypeAgg = byDayType.get(dayTypeKey);
      if (!dayTypeAgg) {
        byDayType.set(dayTypeKey, {
          dayName,
          sessionIds: new Set([session.id]),
          lastTrainedAt: trainedAt,
          lastSessionId: session.id,
        });
      } else {
        dayTypeAgg.sessionIds.add(session.id);
        if (trainedAt > dayTypeAgg.lastTrainedAt) {
          dayTypeAgg.lastTrainedAt = trainedAt;
          dayTypeAgg.lastSessionId = session.id;
        }
      }

      const exerciseAgg = byExercise.get(exerciseId);
      if (!exerciseAgg) {
        byExercise.set(exerciseId, {
          exerciseId,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup as MuscleGroupValue,
          lastTrainedAt: trainedAt,
          sessionIds: new Set([session.id]),
          best1RM: oneRm,
        });
      } else {
        exerciseAgg.sessionIds.add(session.id);
        if (trainedAt > exerciseAgg.lastTrainedAt) exerciseAgg.lastTrainedAt = trainedAt;
        if (oneRm > exerciseAgg.best1RM) exerciseAgg.best1RM = oneRm;
      }
    }

    return {
      programName,
      sessionTypes: Array.from(byDayType.values())
        .map((d) => ({
          dayName: d.dayName,
          sessionsCount: d.sessionIds.size,
          lastTrainedAt: d.lastTrainedAt,
          lastSessionId: d.lastSessionId,
        }))
        .sort((a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime()),
      exercises: Array.from(byExercise.values())
        .map((e) => ({
          exerciseId: e.exerciseId,
          name: e.name,
          muscleGroup: e.muscleGroup,
          lastTrainedAt: e.lastTrainedAt,
          sessionsCount: e.sessionIds.size,
          best1RM: Math.round(e.best1RM * 10) / 10,
        }))
        .sort((a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime()),
    };
  },

  async getExerciseHistory(userId: string, exerciseId: string, range: ProgressRange) {
    const sets = await workoutStatsRepository.findCompletedSetsForExercise(userId, exerciseId);
    if (sets.length === 0) return null;

    const exercise = sets[0].sessionExercise.exercise;
    const cutoffDays = rangeDays[range];
    const cutoff = cutoffDays ? daysAgo(cutoffDays) : null;

    const filtered = sets.filter((s) => !cutoff || s.sessionExercise.session.startedAt >= cutoff);
    if (filtered.length === 0) {
      return {
        exercise,
        series: [],
        metrics: {
          bestWeight: 0,
          best1RM: 0,
          totalVolume: 0,
          avgReps: 0,
          avgWeight: 0,
          progressionPercent: null as number | null,
        },
        insights: [] as string[],
      };
    }

    type SessionAgg = {
      sessionId: string;
      date: Date;
      bestWeight: number;
      best1RM: number;
      volume: number;
      repsSum: number;
      setCount: number;
    };

    const bySession = new Map<string, SessionAgg>();
    for (const set of filtered) {
      const weight = toNumber(set.weight);
      const reps = set.reps ?? 0;
      const oneRm = estimate1RM(weight, reps);
      const sessionId = set.sessionExercise.session.id;

      const agg = bySession.get(sessionId);
      if (!agg) {
        bySession.set(sessionId, {
          sessionId,
          date: set.sessionExercise.session.startedAt,
          bestWeight: weight,
          best1RM: oneRm,
          volume: weight * reps,
          repsSum: reps,
          setCount: 1,
        });
      } else {
        agg.bestWeight = Math.max(agg.bestWeight, weight);
        agg.best1RM = Math.max(agg.best1RM, oneRm);
        agg.volume += weight * reps;
        agg.repsSum += reps;
        agg.setCount += 1;
      }
    }

    const series = Array.from(bySession.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((s) => ({
        date: dateKey(s.date),
        bestWeight: Math.round(s.bestWeight * 10) / 10,
        best1RM: Math.round(s.best1RM * 10) / 10,
        volume: Math.round(s.volume),
        avgReps: Math.round((s.repsSum / s.setCount) * 10) / 10,
        setCount: s.setCount,
      }));

    const bestWeight = Math.max(...series.map((s) => s.bestWeight));
    const best1RM = Math.max(...series.map((s) => s.best1RM));
    const totalVolume = series.reduce((sum, s) => sum + s.volume, 0);
    const avgReps =
      Math.round((filtered.reduce((sum, s) => sum + (s.reps ?? 0), 0) / filtered.length) * 10) / 10;
    const avgWeight =
      Math.round((filtered.reduce((sum, s) => sum + toNumber(s.weight), 0) / filtered.length) * 10) /
      10;

    let progressionPercent: number | null = null;
    if (series.length >= 2) {
      const first = series[0].best1RM;
      const last = series[series.length - 1].best1RM;
      if (first > 0) progressionPercent = Math.round(((last - first) / first) * 1000) / 10;
    }

    const insights: string[] = [];
    if (series.length >= 4) {
      const slope = trendSlope(series.map((s) => s.best1RM));
      if (slope <= 0.05) {
        insights.push(
          `Tu stagnes peut-être sur ${exercise.name} : le 1RM estimé n'a pas progressé récemment.`
        );
      }
    }
    if (progressionPercent !== null && range !== "week") {
      insights.push(
        `${exercise.name} a progressé de ${progressionPercent}% sur la période sélectionnée.`
      );
    }

    return {
      exercise,
      series,
      metrics: { bestWeight, best1RM, totalVolume, avgReps, avgWeight, progressionPercent },
      insights,
    };
  },
};
