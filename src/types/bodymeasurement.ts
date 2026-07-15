export type BodyMeasurementEntryDTO = {
  id: string;
  date: string;
  waistCm: number | null;
  chestCm: number | null;
  hipsCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  note: string | null;
};

export type BodyMeasurementOverviewDTO = {
  entries: BodyMeasurementEntryDTO[];
  latest: BodyMeasurementEntryDTO | null;
};
