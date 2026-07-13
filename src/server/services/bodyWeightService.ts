import { bodyWeightRepository } from "@/server/repositories/bodyWeightRepository";
import { NotFoundError } from "@/server/errors";
import { dateKey, daysAgo, trendSlope } from "@/server/services/analytics";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

type GoalRow = { id: string; targetWeight: unknown; targetDate: Date | null; createdAt: Date };
type EntryRow = { date: string; weight: number };

/** Shared by the full /bodyweight overview and the dashboard's progress ring —
 * progress is measured from the weight logged when the goal was set (or the
 * earliest entry, if there's none before that date) toward the target. */
function computeGoalProgress(goal: GoalRow, entries: EntryRow[], latest: EntryRow | null) {
  const targetWeight = toNumber(goal.targetWeight);
  const goalCreatedKey = dateKey(goal.createdAt);
  const baselineEntry = [...entries].reverse().find((e) => e.date <= goalCreatedKey) ?? entries[0];
  const baselineWeight = baselineEntry ? baselineEntry.weight : (latest?.weight ?? targetWeight);
  const current = latest?.weight ?? baselineWeight;

  let progressPercent = 0;
  if (baselineWeight !== targetWeight) {
    progressPercent = Math.round(
      Math.min(100, Math.max(0, ((baselineWeight - current) / (baselineWeight - targetWeight)) * 100))
    );
  } else if (current === targetWeight) {
    progressPercent = 100;
  }

  return {
    id: goal.id,
    targetWeight,
    targetDate: goal.targetDate ? dateKey(goal.targetDate) : null,
    remaining: Math.round((current - targetWeight) * 10) / 10,
    progressPercent,
  };
}

export const bodyWeightService = {
  async getOverview(userId: string) {
    const [entries, goal, user] = await Promise.all([
      bodyWeightRepository.listEntriesForUser(userId),
      bodyWeightRepository.findLatestGoal(userId),
      bodyWeightRepository.findUserHeight(userId),
    ]);

    const series = entries.map((e) => ({
      id: e.id,
      date: dateKey(e.date),
      weight: toNumber(e.weight),
      note: e.note,
    }));

    const latest = series.length > 0 ? series[series.length - 1] : null;

    const weekAgo = daysAgo(7);
    const monthAgo = daysAgo(30);
    const weeklyAverage = average(
      entries.filter((e) => e.date >= weekAgo).map((e) => toNumber(e.weight))
    );
    const monthlyAverage = average(
      entries.filter((e) => e.date >= monthAgo).map((e) => toNumber(e.weight))
    );

    const bmi =
      latest && user?.heightCm
        ? Math.round((latest.weight / (user.heightCm / 100) ** 2) * 10) / 10
        : null;

    const recentSlice = series.slice(-14);
    const trend =
      recentSlice.length >= 3
        ? Math.round(trendSlope(recentSlice.map((s) => s.weight)) * 1000) / 1000
        : 0;

    const goalDTO = goal ? computeGoalProgress(goal, series, latest) : null;

    return {
      entries: series,
      latest,
      weeklyAverage,
      monthlyAverage,
      bmi,
      heightCm: user?.heightCm ?? null,
      trend,
      goal: goalDTO,
    };
  },

  async logEntry(userId: string, date: string, weight: number, note: string | undefined) {
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return bodyWeightRepository.upsertEntry(userId, parsedDate, weight, note);
  },

  async deleteEntry(userId: string, id: string) {
    const entry = await bodyWeightRepository.findEntry(id);
    if (!entry || entry.userId !== userId) throw new NotFoundError("Entrée introuvable.");
    await bodyWeightRepository.deleteEntry(id);
  },

  async setGoal(userId: string, targetWeight: number, targetDate: string | undefined) {
    const parsedDate = targetDate ? new Date(`${targetDate}T00:00:00.000Z`) : null;
    const existing = await bodyWeightRepository.findLatestGoal(userId);
    if (existing) {
      return bodyWeightRepository.updateGoal(existing.id, targetWeight, parsedDate);
    }
    return bodyWeightRepository.createGoal(userId, targetWeight, parsedDate);
  },

  async setHeight(userId: string, heightCm: number) {
    await bodyWeightRepository.updateUserHeight(userId, heightCm);
  },

  /** Just the goal-progress figure — for the dashboard's progress ring, which
   * doesn't need the full entry history/averages/BMI that getOverview computes. */
  async getGoalSummary(userId: string) {
    const [entries, goal] = await Promise.all([
      bodyWeightRepository.listEntriesForUser(userId),
      bodyWeightRepository.findLatestGoal(userId),
    ]);
    if (!goal) return null;

    const series = entries.map((e) => ({ date: dateKey(e.date), weight: toNumber(e.weight) }));
    const latest = series.length > 0 ? series[series.length - 1] : null;
    return computeGoalProgress(goal, series, latest);
  },
};
