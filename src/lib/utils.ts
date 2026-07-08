import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * For react-hook-form `setValueAs` on optional number inputs. Plain
 * `valueAsNumber: true` turns an empty field into `NaN` (not `undefined`),
 * which then fails a zod `.optional()` check — this keeps an empty field
 * genuinely optional. Also accepts a comma decimal separator (French
 * keyboards produce "8,5"), which a native `type="number"` input would
 * otherwise silently reject as invalid and block form submission entirely.
 *
 * `setValueAs` isn't only called with the raw DOM input string: react-hook-form
 * also runs it over a numeric `defaultValues` entry when the field is first
 * registered, so this must tolerate receiving a `number` (or `undefined`) too.
 */
export function optionalNumber(value: string | number | undefined): number | undefined {
  if (typeof value === "number") return Number.isNaN(value) ? undefined : value
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed === "" ? undefined : Number(trimmed.replace(",", "."))
}

/** Same comma-decimal normalization as `optionalNumber`, for required number fields. */
export function decimalNumber(value: string | number): number {
  if (typeof value === "number") return value
  return Number(value.trim().replace(",", "."))
}

/**
 * For react-hook-form `setValueAs` on optional string inputs (e.g. a `type="date"`
 * field validated with a zod `.regex()`). An empty input yields `""`, which a
 * zod `.optional()` does NOT treat as absent — only `undefined` is — so the
 * regex still runs against an empty string and fails. This keeps it genuinely optional.
 */
export function optionalString(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}
