import { workoutStatsRepository } from "@/server/repositories/workoutStatsRepository";
import { startOfWeek } from "@/server/services/analytics";
import { muscleGroupLabels, type MuscleGroupValue } from "@/lib/constants";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export const insightsService = {
  async generateDashboardInsights(userId: string): Promise<string[]> {
    const sets = await workoutStatsRepository.findCompletedSetsForUser(userId);
    if (sets.length === 0) return [];

    const insights: string[] = [];
    const now = new Date();

    // Detraining: muscle groups not trained in a while.
    const lastTrainedByGroup = new Map<MuscleGroupValue, Date>();
    for (const set of sets) {
      const group = set.sessionExercise.exercise.muscleGroup as MuscleGroupValue;
      const date = set.sessionExercise.session.startedAt;
      const existing = lastTrainedByGroup.get(group);
      if (!existing || date > existing) lastTrainedByGroup.set(group, date);
    }

    const detraining = Array.from(lastTrainedByGroup.entries())
      .map(([group, lastDate]) => ({
        group,
        days: Math.floor((now.getTime() - lastDate.getTime()) / 86_400_000),
      }))
      .filter((g) => g.days >= 9)
      .sort((a, b) => b.days - a.days);

    for (const { group, days } of detraining.slice(0, 2)) {
      insights.push(`Tu n'as pas travaillé ${muscleGroupLabels[group].toLowerCase()} depuis ${days} jours.`);
    }

    // Volume trend: this week vs last week.
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekVolume = 0;
    let lastWeekVolume = 0;
    for (const set of sets) {
      const date = set.sessionExercise.session.startedAt;
      const volume = toNumber(set.weight) * (set.reps ?? 0);
      if (date >= thisWeekStart) thisWeekVolume += volume;
      else if (date >= lastWeekStart) lastWeekVolume += volume;
    }

    if (lastWeekVolume > 0) {
      const change = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
      if (change <= -20) {
        insights.push(`Ton volume total a baissé de ${Math.round(Math.abs(change))}% cette semaine.`);
      } else if (change >= 20) {
        insights.push(`Ton volume total a augmenté de ${Math.round(change)}% cette semaine.`);
      }
    }

    return insights.slice(0, 4);
  },
};
