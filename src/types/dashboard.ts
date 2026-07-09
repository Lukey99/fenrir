export type DashboardActivityExercise = {
  name: string;
  avgWeight: number;
  avgReps: number;
  sets: number;
};

export type DashboardActivitySession = {
  sessionId: string;
  dayName: string | null;
  exercises: DashboardActivityExercise[];
};

export type DashboardStatsDTO = {
  /** Last 14 days, oldest first. */
  activity: {
    date: string;
    weekday: number;
    trained: boolean;
    sessions: DashboardActivitySession[];
  }[];
  profile: {
    name: string | null;
    image: string | null;
    heightCm: number | null;
    latestBodyWeight: number | null;
    totalSessions: number;
  };
  suggestedSessions: {
    programDayId: string;
    programName: string;
    dayName: string;
    label: string | null;
  }[];
  recentPRs: { exerciseId: string; exerciseName: string; weight: number; reps: number; date: string }[];
};
