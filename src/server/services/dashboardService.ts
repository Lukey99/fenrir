import { workoutStatsRepository } from "@/server/repositories/workoutStatsRepository";
import { bodyWeightRepository } from "@/server/repositories/bodyWeightRepository";
import { insightsService } from "@/server/services/insightsService";
import {
  estimate1RM,
  computeStreak,
  startOfWeek,
  startOfMonth,
  daysAgo,
} from "@/server/services/analytics";
import { muscleGroupOrder, type MuscleGroupValue } from "@/lib/constants";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export const dashboardService = {
  async getStats(userId: string) {
    const [sets, sessions, insights, latestBodyWeightEntry] = await Promise.all([
      workoutStatsRepository.findCompletedSetsForUser(userId),
      workoutStatsRepository.findSessionsForUser(userId),
      insightsService.generateDashboardInsights(userId),
      bodyWeightRepository.findLatestForUser(userId),
    ]);

    const streak = computeStreak(sessions.map((s) => s.startedAt));
    const totalSessions = sessions.filter((s) => s.status === "COMPLETED").length;

    const weekStart = startOfWeek();
    const monthStart = startOfMonth();
    let volumeThisWeek = 0;
    let volumeThisMonth = 0;

    const muscleGroupCounts = new Map<MuscleGroupValue, number>();
    const sevenDaysAgo = daysAgo(7);

    // Track running best 1RM per exercise, in chronological order, to detect PRs.
    const sortedSets = [...sets].sort(
      (a, b) => a.sessionExercise.session.startedAt.getTime() - b.sessionExercise.session.startedAt.getTime()
    );
    const bestByExercise = new Map<string, number>();
    const prs: { exerciseName: string; weight: number; reps: number; date: Date }[] = [];

    for (const set of sortedSets) {
      const date = set.sessionExercise.session.startedAt;
      const weight = toNumber(set.weight);
      const reps = set.reps ?? 0;
      const volume = weight * reps;

      if (date >= weekStart) volumeThisWeek += volume;
      if (date >= monthStart) volumeThisMonth += volume;

      if (date >= sevenDaysAgo) {
        const group = set.sessionExercise.exercise.muscleGroup as MuscleGroupValue;
        muscleGroupCounts.set(group, (muscleGroupCounts.get(group) ?? 0) + 1);
      }

      const oneRm = estimate1RM(weight, reps);
      const exerciseId = set.sessionExercise.exerciseId;
      const best = bestByExercise.get(exerciseId) ?? 0;
      if (oneRm > best) {
        bestByExercise.set(exerciseId, oneRm);
        if (best > 0) {
          prs.push({
            exerciseName: set.sessionExercise.exercise.name,
            weight,
            reps,
            date,
          });
        }
      }
    }

    const recentPRs = prs
      .filter((pr) => pr.date >= daysAgo(30))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    const muscleGroups = muscleGroupOrder.map((group) => ({
      group,
      count: muscleGroupCounts.get(group) ?? 0,
    }));

    // Indicative target: ~3 sessions/week, prorated to elapsed days this month.
    const daysElapsedThisMonth = Math.max(
      1,
      Math.floor((Date.now() - monthStart.getTime()) / 86_400_000) + 1
    );
    const sessionsThisMonth = sessions.filter(
      (s) => s.status === "COMPLETED" && s.startedAt >= monthStart
    ).length;
    const target = Math.max(1, Math.round((daysElapsedThisMonth / 7) * 3));
    const consistency = Math.min(100, Math.round((sessionsThisMonth / target) * 100));

    const recentActivity = sessions.slice(0, 5).map((session) => {
      const volume = session.exercises
        .flatMap((e) => e.sets)
        .reduce((sum, set) => sum + toNumber(set.weight) * (set.reps ?? 0), 0);
      return {
        id: session.id,
        date: session.startedAt,
        name: session.programDay?.name ?? "Séance libre",
        status: session.status,
        exerciseCount: session.exercises.filter((e) => e.action !== "SKIPPED").length,
        volume: Math.round(volume),
      };
    });

    return {
      streak,
      totalSessions,
      volumeThisWeek: Math.round(volumeThisWeek),
      volumeThisMonth: Math.round(volumeThisMonth),
      recentPRs,
      muscleGroups,
      consistency,
      sessionsThisMonth,
      recentActivity,
      insights,
      latestBodyWeight: latestBodyWeightEntry ? toNumber(latestBodyWeightEntry.weight) : null,
    };
  },
};
