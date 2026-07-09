import { workoutStatsRepository } from "@/server/repositories/workoutStatsRepository";
import { bodyWeightRepository } from "@/server/repositories/bodyWeightRepository";
import { programRepository } from "@/server/repositories/programRepository";
import { settingsService } from "@/server/services/settingsService";
import { dateKey, daysAgo, detectPRs, selectRecentPRs } from "@/server/services/analytics";

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

    const prs = detectPRs(
      sets.map((set) => ({
        exerciseId: set.sessionExercise.exerciseId,
        exerciseName: set.sessionExercise.exercise.name,
        weight: toNumber(set.weight),
        reps: set.reps ?? 0,
        date: set.sessionExercise.session.startedAt,
      }))
    );

    // A dedicated table reads sparse at 5 rows over 30 days for most training
    // frequencies — a wider window/count gives it a fuller body.
    const recentPRs = selectRecentPRs(prs, 90, 10);

    const sessionsByDay = new Map<
      string,
      {
        sessionId: string;
        dayName: string | null;
        exercises: { name: string; avgWeight: number; avgReps: number; sets: number }[];
      }[]
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
        exercises: trainedExercises.map((se) => ({
          name: se.exercise.name,
          avgWeight:
            Math.round((se.sets.reduce((sum, set) => sum + toNumber(set.weight), 0) / se.sets.length) * 10) /
            10,
          avgReps: Math.round(se.sets.reduce((sum, set) => sum + (set.reps ?? 0), 0) / se.sets.length),
          sets: se.sets.length,
        })),
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
        heightCm: profile.heightCm,
        latestBodyWeight: latestBodyWeightEntry ? toNumber(latestBodyWeightEntry.weight) : null,
        totalSessions,
      },
      suggestedSessions,
      recentPRs,
    };
  },
};
