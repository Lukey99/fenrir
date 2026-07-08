"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

type SeriesPoint = { date: string; weight: number };

function formatDate(value: string) {
  const d = new Date(value);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function WeightTooltip({
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
      <p className="text-xs text-muted-foreground">{label ? formatDate(label) : ""}</p>
    </div>
  );
}

export function WeightChart({
  series,
  color,
  unitLabel,
  goalWeight,
}: {
  series: SeriesPoint[];
  color: string;
  unitLabel: string;
  goalWeight?: number | null;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
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
          domain={["dataMin - 2", "dataMax + 2"]}
        />
        <Tooltip content={<WeightTooltip unitLabel={unitLabel} />} cursor={{ stroke: "var(--border)" }} />
        {goalWeight != null && (
          <ReferenceLine
            y={goalWeight}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            label={{
              value: `Objectif · ${goalWeight} ${unitLabel}`,
              position: "insideTopRight",
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
