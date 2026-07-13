import { workoutStatsRepository } from "@/server/repositories/workoutStatsRepository";
import { bodyWeightRepository } from "@/server/repositories/bodyWeightRepository";
import { programRepository } from "@/server/repositories/programRepository";
import { personalRecordRepository } from "@/server/repositories/personalRecordRepository";
import { settingsService } from "@/server/services/settingsService";
import { bodyWeightService } from "@/server/services/bodyWeightService";
import { dateKey, daysAgo } from "@/server/services/analytics";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export const dashboardService = {
  async getStats(userId: string) {
    const [
      recentRecords,
      sessionSummaries,
      totalSessions,
      inProgressSessions,
      activeSession,
      mostRecentSession,
      latestBodyWeightEntry,
      profile,
      suggestedDays,
      weightGoal,
    ] = await Promise.all([
      personalRecordRepository.findRecentForUser(userId, 10),
      workoutStatsRepository.findSessionSummariesSince(userId, daysAgo(13)),
      workoutStatsRepository.countCompletedSessionsForUser(userId),
      workoutStatsRepository.countInProgressSessionsForUser(userId),
      workoutStatsRepository.findActiveSessionForUser(userId),
      workoutStatsRepository.findMostRecentSessionForUser(userId),
      bodyWeightRepository.findLatestForUser(userId),
      settingsService.getProfile(userId),
      programRepository.findTodaysSuggestedDaysForUser(userId, new Date().getDay()),
      bodyWeightService.getGoalSummary(userId),
    ]);

    const recentPRs = recentRecords.map((r) => ({
      exerciseId: r.exercise.id,
      exerciseName: r.exercise.name,
      muscleGroup: r.exercise.muscleGroup,
      weight: toNumber(r.weight),
      reps: r.reps,
      date: r.achievedAt,
    }));

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

    // Monday-anchored current week, matching the weekday convention used
    // elsewhere (0=Sunday..6=Saturday via getUTCDay()).
    const daysSinceMonday = (todayUtc.getUTCDay() + 6) % 7;
    const weekStart = new Date(todayUtc);
    weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
    const weekStartKey = dateKey(weekStart);
    const sessionsThisWeek = Array.from(sessionsByDay.entries())
      .filter(([key]) => key >= weekStartKey)
      .reduce((sum, [, sessions]) => sum + sessions.length, 0);

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
      counts: {
        totalSessions,
        sessionsThisWeek,
        inProgressSessions,
      },
      activeSession: activeSession
        ? {
            sessionId: activeSession.id,
            dayName: activeSession.programDay?.name ?? null,
            startedAt: activeSession.startedAt,
          }
        : null,
      weightGoal: weightGoal
        ? {
            targetWeight: weightGoal.targetWeight,
            remaining: weightGoal.remaining,
            progressPercent: weightGoal.progressPercent,
          }
        : null,
      lastSession: mostRecentSession
        ? {
            sessionId: mostRecentSession.id,
            dayName: mostRecentSession.programDay?.name ?? null,
            date: mostRecentSession.startedAt,
            exercises: mostRecentSession.exercises
              .filter((se) => se.action !== "SKIPPED" && se.sets.length > 0)
              .map((se) => se.exercise.name),
          }
        : null,
    };
  },
};
