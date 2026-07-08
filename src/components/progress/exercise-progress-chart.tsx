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

type SeriesPoint = {
  date: string;
  best1RM: number;
  volume: number;
  bestWeight: number;
  avgReps: number;
  setCount: number;
};

function formatDate(value: string) {
  const d = new Date(value);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function SessionTooltip({
  active,
  payload,
  label,
  unitLabel,
  oneRmColor,
  weightColor,
}: {
  active?: boolean;
  payload?: { payload: SeriesPoint }[];
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
        {point.best1RM} {unitLabel} <span className="font-normal text-muted-foreground">1RM estimé</span>
      </p>
      <p className="font-heading font-semibold" style={{ color: weightColor }}>
        {point.bestWeight} {unitLabel} <span className="font-normal text-muted-foreground">Poids</span>
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {point.setCount} série{point.setCount > 1 ? "s" : ""} · {point.avgReps} reps moy.
      </p>
    </div>
  );
}

/** 1RM estimé (avec dégradé) et poids logué sur le même graphique — un survol
 * (desktop) ou un appui (mobile, geré nativement par Recharts) sur un point
 * affiche les deux valeurs, le nombre de séries et de reps. */
export function SessionTrendChart({
  series,
  color,
  unitLabel,
  height = 220,
}: {
  series: SeriesPoint[];
  color: string;
  unitLabel: string;
  height?: number | `${number}%`;
}) {
  const gradientId = `session-trend-gradient-${useId()}`;
  const weightColor = "var(--muted-foreground)";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
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
          content={<SessionTooltip unitLabel={unitLabel} oneRmColor={color} weightColor={weightColor} />}
          cursor={{ stroke: "var(--border)" }}
        />
        <Area
          type="monotone"
          dataKey="best1RM"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="bestWeight"
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
