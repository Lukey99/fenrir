"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type RecordPoint = {
  achievedAt: string;
  estimated1RM: number;
  weight: number;
  reps: number;
};

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function RecordTooltip({
  active,
  payload,
  label,
  unitLabel,
  oneRmColor,
  weightColor,
}: {
  active?: boolean;
  payload?: { payload: RecordPoint }[];
  label?: string;
  unitLabel: string;
  oneRmColor: string;
  weightColor: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1.5 text-xs text-muted-foreground">{label ? formatDate(label) : ""}</p>
      <p className="font-heading font-semibold" style={{ color: oneRmColor }}>
        {point.estimated1RM} {unitLabel} <span className="font-normal text-muted-foreground">1RM estimé</span>
      </p>
      <p className="font-heading font-semibold" style={{ color: weightColor }}>
        {point.weight} {unitLabel} <span className="font-normal text-muted-foreground">Poids</span>
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{point.reps} reps</p>
    </div>
  );
}

/** Same visual language as the workout-progress chart (SessionTrendChart) — a
 * gradient area for the estimated 1RM plus a dashed line for the raw weight —
 * but with a tooltip suited to a single manually-logged record rather than an
 * aggregate of a session's sets (no "avg reps"/"set count" here). */
export function RecordProgressionChart({
  records,
  color,
  unitLabel,
  height = 260,
}: {
  records: RecordPoint[];
  color: string;
  unitLabel: string;
  height?: number | `${number}%`;
}) {
  const gradientId = `record-progression-gradient-${useId()}`;
  const weightColor = "var(--muted-foreground)";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={records} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="achievedAt"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={<RecordTooltip unitLabel={unitLabel} oneRmColor={color} weightColor={weightColor} />}
          cursor={{ stroke: "var(--border)" }}
        />
        <Area
          type="monotone"
          dataKey="estimated1RM"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke={weightColor}
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={{ r: 3, fill: weightColor, strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
