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

export const progressService = {
  async listTrainedExercises(userId: string) {
    const sets = await workoutStatsRepository.findCompletedSetsForUser(userId);

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

    for (const set of sets) {
      const { exerciseId, exercise, session } = set.sessionExercise;
      const weight = toNumber(set.weight);
      const reps = set.reps ?? 0;
      const oneRm = estimate1RM(weight, reps);

      const existing = byExercise.get(exerciseId);
      if (!existing) {
        byExercise.set(exerciseId, {
          exerciseId,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup as MuscleGroupValue,
          lastTrainedAt: session.startedAt,
          sessionIds: new Set([session.id]),
          best1RM: oneRm,
        });
      } else {
        existing.sessionIds.add(session.id);
        if (session.startedAt > existing.lastTrainedAt) existing.lastTrainedAt = session.startedAt;
        if (oneRm > existing.best1RM) existing.best1RM = oneRm;
      }
    }

    return Array.from(byExercise.values())
      .map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        muscleGroup: e.muscleGroup,
        lastTrainedAt: e.lastTrainedAt,
        sessionsCount: e.sessionIds.size,
        best1RM: Math.round(e.best1RM * 10) / 10,
      }))
      .sort((a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime());
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
    if (progressionPercent !== null && progressionPercent > 0 && range !== "week") {
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
