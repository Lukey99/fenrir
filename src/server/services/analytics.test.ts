import { describe, it, expect, vi, afterEach } from "vitest";
import { estimate1RM, dateKey, computeStreak, trendSlope } from "@/server/services/analytics";

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
