import { z } from "zod";

const measurementField = z.number().min(10, "Trop petite.").max(300, "Trop grande.").optional();

export const logBodyMeasurementEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  waistCm: measurementField,
  chestCm: measurementField,
  hipsCm: measurementField,
  armCm: measurementField,
  thighCm: measurementField,
  calfCm: measurementField,
  note: z.string().trim().max(300).optional(),
});
export type LogBodyMeasurementEntryInput = z.infer<typeof logBodyMeasurementEntrySchema>;

export const measurementFieldKeys = [
  "waistCm",
  "chestCm",
  "hipsCm",
  "armCm",
  "thighCm",
  "calfCm",
] as const;

export function hasAnyMeasurement(input: LogBodyMeasurementEntryInput): boolean {
  return measurementFieldKeys.some((key) => input[key] != null);
}
