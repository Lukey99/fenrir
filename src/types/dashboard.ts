import type { MuscleGroupValue } from "@/lib/constants";

export type DashboardStatsDTO = {
  streak: number;
  totalSessions: number;
  volumeThisWeek: number;
  volumeThisMonth: number;
  recentPRs: { exerciseName: string; weight: number; reps: number; date: string }[];
  muscleGroups: { group: MuscleGroupValue; count: number }[];
  consistency: number;
  sessionsThisMonth: number;
  recentActivity: {
    id: string;
    date: string;
    name: string;
    status: string;
    exerciseCount: number;
    volume: number;
  }[];
  insights: string[];
  latestBodyWeight: number | null;
};
