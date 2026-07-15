"use client";

import { useState } from "react";

import type { BodyWeightOverviewDTO } from "@/types/bodyweight";
import type { BodyMeasurementOverviewDTO } from "@/types/bodymeasurement";
import { cn } from "@/lib/utils";
import { BodyweightTracker } from "@/components/bodyweight/bodyweight-tracker";
import { MeasurementTracker } from "@/components/measurements/measurement-tracker";

const tabs = [
  { key: "weight", label: "Poids" },
  { key: "measurements", label: "Mensurations" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function BodyTrackingTabs({
  weightOverview,
  measurementOverview,
}: {
  weightOverview: BodyWeightOverviewDTO;
  measurementOverview: BodyMeasurementOverviewDTO;
}) {
  const [tab, setTab] = useState<TabKey>("weight");

  return (
    <div className="space-y-6">
      <div role="tablist" className="inline-flex items-center gap-1 rounded-xl border bg-muted/40 p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === item.key
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "weight" ? (
        <BodyweightTracker initialOverview={weightOverview} />
      ) : (
        <MeasurementTracker initialOverview={measurementOverview} />
      )}
    </div>
  );
}
