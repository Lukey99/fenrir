import { personalRecordRepository } from "@/server/repositories/personalRecordRepository";
import { exerciseRepository } from "@/server/repositories/exerciseRepository";
import { NotFoundError } from "@/server/errors";
import { estimate1RM, dateKey } from "@/server/services/analytics";
import {
  muscleGroupToCategory,
  muscleCategoryOrder,
  type MuscleGroupValue,
  type MuscleCategoryValue,
} from "@/lib/constants";
import type { CreatePersonalRecordInput } from "@/server/validators/personalRecord";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

type BestExerciseRecord = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroupValue;
  bestWeight: number;
  bestReps: number;
  bestDate: string;
  best1RM: number;
  recordsCount: number;
};

export const personalRecordService = {
  async create(userId: string, input: CreatePersonalRecordInput) {
    const exercise = await exerciseRepository.findVisibleById(input.exerciseId, userId);
    if (!exercise) throw new NotFoundError("Exercice introuvable.");

    return personalRecordRepository.create(userId, {
      exerciseId: input.exerciseId,
      weight: input.weight,
      reps: input.reps,
      achievedAt: new Date(`${input.achievedAt}T00:00:00.000Z`),
    });
  },

  async remove(userId: string, id: string) {
    const record = await personalRecordRepository.findById(id);
    if (!record || record.userId !== userId) throw new NotFoundError("Record introuvable.");
    await personalRecordRepository.delete(id);
  },

  /** Every exercise's best logged record (highest estimated 1RM), grouped into
   * the broad muscle categories the Records page browses by. */
  async getOverview(userId: string) {
    const records = await personalRecordRepository.findAllForUser(userId);

    const bestByExercise = new Map<string, BestExerciseRecord>();
    for (const r of records) {
      const weight = toNumber(r.weight);
      const oneRm = estimate1RM(weight, r.reps);
      const achievedDateKey = dateKey(r.achievedAt);
      const existing = bestByExercise.get(r.exercise.id);

      if (!existing) {
        bestByExercise.set(r.exercise.id, {
          exerciseId: r.exercise.id,
          exerciseName: r.exercise.name,
          muscleGroup: r.exercise.muscleGroup as MuscleGroupValue,
          bestWeight: weight,
          bestReps: r.reps,
          bestDate: achievedDateKey,
          best1RM: oneRm,
          recordsCount: 1,
        });
      } else {
        existing.recordsCount += 1;
        if (oneRm > existing.best1RM) {
          existing.best1RM = oneRm;
          existing.bestWeight = weight;
          existing.bestReps = r.reps;
          existing.bestDate = achievedDateKey;
        }
      }
    }

    const byCategory = new Map<MuscleCategoryValue, BestExerciseRecord[]>();
    for (const best of bestByExercise.values()) {
      const category = muscleGroupToCategory[best.muscleGroup];
      const list = byCategory.get(category) ?? [];
      list.push(best);
      byCategory.set(category, list);
    }

    const categories = muscleCategoryOrder
      .filter((category) => byCategory.has(category))
      .map((category) => ({
        category,
        exercises: byCategory
          .get(category)!
          .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName))
          .map((exercise) => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            muscleGroup: exercise.muscleGroup,
            bestWeight: exercise.bestWeight,
            bestReps: exercise.bestReps,
            bestDate: exercise.bestDate,
            recordsCount: exercise.recordsCount,
          })),
      }));

    return { categories, hasAnyRecords: records.length > 0 };
  },

  async getExerciseProgression(userId: string, exerciseId: string) {
    const exercise = await exerciseRepository.findVisibleById(exerciseId, userId);
    if (!exercise) throw new NotFoundError("Exercice introuvable.");

    const records = await personalRecordRepository.findForExercise(userId, exerciseId);

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup as MuscleGroupValue,
      records: records.map((r) => {
        const weight = toNumber(r.weight);
        return {
          id: r.id,
          weight,
          reps: r.reps,
          achievedAt: dateKey(r.achievedAt),
          estimated1RM: Math.round(estimate1RM(weight, r.reps) * 10) / 10,
        };
      }),
    };
  },
};
