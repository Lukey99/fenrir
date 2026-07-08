/** Epley formula: a standard estimated-1RM approximation from a single set. */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0) return weight;
  return weight * (1 + reps / 30);
}

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number): Date {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export function startOfWeek(date = new Date()): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

export function startOfMonth(date = new Date()): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

/**
 * Current streak of consecutive training days, counting back from the most
 * recent training day. Considered "alive" only if the last training day was
 * today or yesterday — otherwise the streak has already broken.
 */
export function computeStreak(trainingDates: Date[]): number {
  const uniqueDays = Array.from(new Set(trainingDates.map((d) => dateKey(d)))).sort().reverse();
  if (uniqueDays.length === 0) return 0;

  const today = startOfDay(new Date());
  const mostRecent = new Date(uniqueDays[0]);
  const gapFromToday = Math.round((today.getTime() - mostRecent.getTime()) / 86_400_000);
  if (gapFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const current = new Date(uniqueDays[i - 1]);
    const prev = new Date(uniqueDays[i]);
    const gap = Math.round((current.getTime() - prev.getTime()) / 86_400_000);
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Simple linear regression slope over evenly-indexed points (0..n-1). */
export function trendSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  values.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  return den === 0 ? 0 : num / den;
}
