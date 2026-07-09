import { describe, it, expect, vi, afterEach } from "vitest";
import {
  estimate1RM,
  dateKey,
  computeStreak,
  trendSlope,
  detectPRs,
  selectRecentPRs,
  type SetForPRDetection,
} from "@/server/services/analytics";

afterEach(() => {
  vi.useRealTimers();
});

describe("estimate1RM", () => {
  it("applies the Epley formula for a normal set", () => {
    // 80 * (1 + 10/30) = 106.66...
    expect(estimate1RM(80, 10)).toBeCloseTo(106.667, 2);
  });

  it("returns the weight unchanged for 0 reps (division-by-zero guard)", () => {
    expect(estimate1RM(100, 0)).toBe(100);
  });

  it("returns the weight unchanged for negative reps", () => {
    expect(estimate1RM(100, -5)).toBe(100);
  });

  it("returns 0 for a bodyweight-only set with no reps", () => {
    expect(estimate1RM(0, 10)).toBe(0);
  });
});

describe("dateKey", () => {
  it("formats a date as YYYY-MM-DD in UTC", () => {
    expect(dateKey(new Date("2026-03-05T23:59:59.000Z"))).toBe("2026-03-05");
  });
});

function utc(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00.000Z`);
}

describe("computeStreak", () => {
  it("returns 0 for no training days", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 0 when the last training day was more than 1 day ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    expect(computeStreak([utc("2026-07-07")])).toBe(0);
  });

  it("counts a streak that is still alive as of today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    expect(
      computeStreak([utc("2026-07-10"), utc("2026-07-09"), utc("2026-07-08")])
    ).toBe(3);
  });

  it("counts a streak that is still alive as of yesterday (grace day)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    expect(computeStreak([utc("2026-07-09"), utc("2026-07-08")])).toBe(2);
  });

  it("stops counting at the first gap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    // 10th and 9th are consecutive, then a gap before the 5th.
    expect(computeStreak([utc("2026-07-10"), utc("2026-07-09"), utc("2026-07-05")])).toBe(2);
  });

  it("de-duplicates multiple sessions on the same day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    expect(
      computeStreak([utc("2026-07-10"), utc("2026-07-10"), utc("2026-07-09")])
    ).toBe(2);
  });
});

function mkSet(
  exerciseId: string,
  weight: number,
  reps: number,
  dateStr: string,
  exerciseName = exerciseId
): SetForPRDetection {
  return { exerciseId, exerciseName, weight, reps, date: utc(dateStr) };
}

describe("detectPRs", () => {
  it("never flags the first set logged for an exercise (no baseline to beat)", () => {
    expect(detectPRs([mkSet("squat", 80, 5, "2026-01-01")])).toEqual([]);
  });

  it("flags a strictly higher 1RM as a PR", () => {
    const sets = [mkSet("squat", 80, 5, "2026-01-01"), mkSet("squat", 90, 5, "2026-01-08")];
    const prs = detectPRs(sets);
    expect(prs).toHaveLength(1);
    expect(prs[0]).toMatchObject({ exerciseId: "squat", weight: 90, reps: 5 });
  });

  it("does not flag a tie (same 1RM as the current best)", () => {
    const sets = [mkSet("squat", 80, 5, "2026-01-01"), mkSet("squat", 80, 5, "2026-01-08")];
    expect(detectPRs(sets)).toEqual([]);
  });

  it("does not flag a lower 1RM, and the best doesn't regress afterward", () => {
    const sets = [
      mkSet("squat", 90, 5, "2026-01-01"),
      mkSet("squat", 80, 5, "2026-01-08"), // lower — not a PR
      mkSet("squat", 90, 5, "2026-01-15"), // ties the original best — still not a PR
    ];
    expect(detectPRs(sets)).toEqual([]);
  });

  it("tracks each exercise's baseline independently", () => {
    const sets = [mkSet("squat", 80, 5, "2026-01-01"), mkSet("bench", 60, 5, "2026-01-01")];
    expect(detectPRs(sets)).toEqual([]);
  });

  it("sorts by date internally regardless of input order", () => {
    const sets = [
      mkSet("squat", 90, 5, "2026-01-08"), // later date, listed first
      mkSet("squat", 80, 5, "2026-01-01"), // earlier date, listed second
    ];
    const prs = detectPRs(sets);
    expect(prs).toHaveLength(1);
    expect(prs[0].weight).toBe(90);
  });
});

describe("selectRecentPRs", () => {
  const prs = [
    { date: utc("2026-07-10"), label: "today" },
    { date: utc("2026-04-11"), label: "exactly 90 days ago" },
    { date: utc("2026-04-10"), label: "91 days ago" },
  ];

  it("includes a PR exactly at the boundary (inclusive) and excludes anything older", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    const result = selectRecentPRs(prs, 90, 10);
    expect(result.map((r) => r.label)).toEqual(["today", "exactly 90 days ago"]);
  });

  it("sorts newest first", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    const result = selectRecentPRs(prs, 90, 10);
    expect(result[0].label).toBe("today");
  });

  it("respects the limit", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T10:00:00.000Z"));
    const result = selectRecentPRs(prs, 90, 1);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("today");
  });
});

describe("trendSlope", () => {
  it("returns 0 for fewer than 2 points", () => {
    expect(trendSlope([])).toBe(0);
    expect(trendSlope([42])).toBe(0);
  });

  it("returns 0 for a flat series", () => {
    expect(trendSlope([50, 50, 50, 50])).toBe(0);
  });

  it("returns a positive slope for an increasing series", () => {
    expect(trendSlope([10, 20, 30, 40])).toBeGreaterThan(0);
  });

  it("returns a negative slope for a decreasing series", () => {
    expect(trendSlope([40, 30, 20, 10])).toBeLessThan(0);
  });
});
