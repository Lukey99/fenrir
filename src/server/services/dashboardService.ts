import { workoutStatsRepository } from "@/server/repositories/workoutStatsRepository";
import { bodyWeightRepository } from "@/server/repositories/bodyWeightRepository";
import { programRepository } from "@/server/repositories/programRepository";
import { settingsService } from "@/server/services/settingsService";
import { estimate1RM, dateKey, daysAgo } from "@/server/services/analytics";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export const dashboardService = {
  async getStats(userId: string) {
    const [sets, sessionSummaries, totalSessions, latestBodyWeightEntry, profile, suggestedDays] =
      await Promise.all([
        workoutStatsRepository.findCompletedSetsForUser(userId),
        workoutStatsRepository.findSessionSummariesSince(userId, daysAgo(13)),
        workoutStatsRepository.countCompletedSessionsForUser(userId),
        bodyWeightRepository.findLatestForUser(userId),
        settingsService.getProfile(userId),
        programRepository.findTodaysSuggestedDaysForUser(userId, new Date().getDay()),
      ]);

    // Track running best 1RM per exercise, in chronological order, to detect PRs.
    const sortedSets = [...sets].sort(
      (a, b) => a.sessionExercise.session.startedAt.getTime() - b.sessionExercise.session.startedAt.getTime()
    );
    const bestByExercise = new Map<string, number>();
    const prs: { exerciseId: string; exerciseName: string; weight: number; reps: number; date: Date }[] = [];

    for (const set of sortedSets) {
      const date = set.sessionExercise.session.startedAt;
      const weight = toNumber(set.weight);
      const reps = set.reps ?? 0;
      const oneRm = estimate1RM(weight, reps);
      const exerciseId = set.sessionExercise.exerciseId;
      const best = bestByExercise.get(exerciseId) ?? 0;

      if (oneRm > best) {
        bestByExercise.set(exerciseId, oneRm);
        if (best > 0) {
          prs.push({ exerciseId, exerciseName: set.sessionExercise.exercise.name, weight, reps, date });
        }
      }
    }

    // A dedicated table reads sparse at 5 rows over 30 days for most training
    // frequencies — a wider window/count gives it a fuller body.
    const recentPRs = prs
      .filter((pr) => pr.date >= daysAgo(90))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    const sessionsByDay = new Map<
      string,
      { sessionId: string; dayName: string | null; exercises: string[]; totalSets: number }[]
    >();
    for (const s of sessionSummaries) {
      const trainedExercises = s.exercises.filter(
        (se) => se.action !== "SKIPPED" && se.sets.length > 0
      );
      const key = dateKey(s.startedAt);
      const list = sessionsByDay.get(key) ?? [];
      list.push({
        sessionId: s.id,
        dayName: s.programDay?.name ?? null,
        exercises: trainedExercises.map((se) => se.exercise.name),
        totalSets: trainedExercises.reduce((sum, se) => sum + se.sets.length, 0),
      });
      sessionsByDay.set(key, list);
    }

    // Both sides must stay UTC-anchored throughout (matches computeStreak's fix):
    // mixing daysAgo()'s LOCAL midnight with dateKey()'s UTC round-trip would shift
    // every bucket by the timezone offset, so "today" would never match sessionsByDay.
    const todayUtc = new Date(dateKey(new Date()));
    const activity = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(todayUtc);
      date.setUTCDate(date.getUTCDate() - (13 - i));
      const key = dateKey(date);
      const daySessions = sessionsByDay.get(key) ?? [];
      return { date: key, weekday: date.getUTCDay(), trained: daySessions.length > 0, sessions: daySessions };
    });

    const suggestedSessions = suggestedDays.map((day) => ({
      programDayId: day.id,
      programName: day.program.name,
      dayName: day.name,
      label: day.label,
    }));

    return {
      activity,
      profile: {
        name: profile.name,
        image: profile.image,
        heightCm: profile.heightCm,
        latestBodyWeight: latestBodyWeightEntry ? toNumber(latestBodyWeightEntry.weight) : null,
        totalSessions,
      },
      suggestedSessions,
      recentPRs,
    };
  },
};
