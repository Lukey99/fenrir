"use client";

import { useSession } from "next-auth/react";
import { toDisplayWeight, fromDisplayWeight, weightUnitLabel, type WeightUnit } from "@/lib/units";

/** Reads the signed-in user's kg/lbs preference and exposes conversion helpers for display/input. */
export function useUnit() {
  const { data: session } = useSession();
  const unit: WeightUnit = session?.user?.unitPreference ?? "KG";

  return {
    unit,
    unitLabel: weightUnitLabel(unit),
    toDisplay: (kg: number) => toDisplayWeight(kg, unit),
    fromDisplay: (value: number) => fromDisplayWeight(value, unit),
  };
}
