export type WeightUnit = "KG" | "LBS";

const KG_TO_LBS = 2.2046226218;

export function kgToLbs(kg: number): number {
  return kg * KG_TO_LBS;
}

export function lbsToKg(lbs: number): number {
  return lbs / KG_TO_LBS;
}

/** Raw kg value (as stored) -> a rounded number in the user's preferred unit, for display. */
export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  const value = unit === "LBS" ? kgToLbs(kg) : kg;
  return Math.round(value * 10) / 10;
}

/** A value typed by the user in their preferred unit -> kg, for storage. */
export function fromDisplayWeight(value: number, unit: WeightUnit): number {
  const kg = unit === "LBS" ? lbsToKg(value) : value;
  return Math.round(kg * 100) / 100;
}

export function weightUnitLabel(unit: WeightUnit): string {
  return unit === "LBS" ? "lb" : "kg";
}
