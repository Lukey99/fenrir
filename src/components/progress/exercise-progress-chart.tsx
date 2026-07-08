"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
};

function formatDate(value: string) {
  const d = new Date(value);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function OneRmTooltip({
  active,
  payload,
  label,
  unitLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unitLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-heading font-semibold">
        {payload[0].value} {unitLabel}
      </p>
      <p className="text-xs text-muted-foreground">{label ? formatDate(label) : ""} · 1RM estimé</p>
    </div>
  );
}

function VolumeTooltip({
  active,
  payload,
  label,
  unitLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unitLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-heading font-semibold">
        {payload[0].value} {unitLabel}
      </p>
      <p className="text-xs text-muted-foreground">{label ? formatDate(label) : ""} · volume</p>
    </div>
  );
}

export function OneRmTrendChart({
  series,
  color,
  unitLabel,
}: {
  series: SeriesPoint[];
  color: string;
  unitLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
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
        <Tooltip content={<OneRmTooltip unitLabel={unitLabel} />} cursor={{ stroke: "var(--border)" }} />
        <Line
          type="monotone"
          dataKey="best1RM"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function VolumeBarChart({
  series,
  color,
  unitLabel,
}: {
  series: SeriesPoint[];
  color: string;
  unitLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
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
        <Tooltip content={<VolumeTooltip unitLabel={unitLabel} />} cursor={{ fill: "var(--accent)" }} />
        <Bar dataKey="volume" fill={color} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
