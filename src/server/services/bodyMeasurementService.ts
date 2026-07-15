import { bodyMeasurementRepository } from "@/server/repositories/bodyMeasurementRepository";
import { NotFoundError } from "@/server/errors";
import { dateKey } from "@/server/services/analytics";
import { measurementFieldKeys, type LogBodyMeasurementEntryInput } from "@/server/validators/bodymeasurement";

function toNumberOrNull(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}

export const bodyMeasurementService = {
  async getOverview(userId: string) {
    const entries = await bodyMeasurementRepository.listEntriesForUser(userId);

    const series = entries.map((entry) => ({
      id: entry.id,
      date: dateKey(entry.date),
      waistCm: toNumberOrNull(entry.waistCm),
      chestCm: toNumberOrNull(entry.chestCm),
      hipsCm: toNumberOrNull(entry.hipsCm),
      armCm: toNumberOrNull(entry.armCm),
      thighCm: toNumberOrNull(entry.thighCm),
      calfCm: toNumberOrNull(entry.calfCm),
      note: entry.note,
    }));

    const latest = series.length > 0 ? series[series.length - 1] : null;

    return { entries: series, latest };
  },

  async logEntry(userId: string, input: LogBodyMeasurementEntryInput) {
    const { date, note } = input;
    const fields = Object.fromEntries(
      measurementFieldKeys
        .filter((key) => input[key] != null)
        .map((key) => [key, input[key]])
    );
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    return bodyMeasurementRepository.upsertEntry(userId, parsedDate, fields, note);
  },

  async deleteEntry(userId: string, id: string) {
    const entry = await bodyMeasurementRepository.findEntry(id);
    if (!entry || entry.userId !== userId) throw new NotFoundError("Entrée introuvable.");
    await bodyMeasurementRepository.deleteEntry(id);
  },
};
