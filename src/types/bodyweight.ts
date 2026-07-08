export type BodyWeightEntryDTO = {
  id: string;
  date: string;
  weight: number;
  note: string | null;
};

export type WeightGoalDTO = {
  id: string;
  targetWeight: number;
  targetDate: string | null;
  remaining: number;
  progressPercent: number;
};

export type BodyWeightOverviewDTO = {
  entries: BodyWeightEntryDTO[];
  latest: BodyWeightEntryDTO | null;
  weeklyAverage: number | null;
  monthlyAverage: number | null;
  bmi: number | null;
  heightCm: number | null;
  trend: number;
  goal: WeightGoalDTO | null;
};
