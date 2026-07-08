import { prisma } from "@/lib/prisma";
import { exerciseRepository } from "@/server/repositories/exerciseRepository";
import { bodyWeightRepository } from "@/server/repositories/bodyWeightRepository";
import { userRepository } from "@/server/repositories/userRepository";
import type { ExportData } from "@/server/validators/dataPortability";
import type { MuscleGroupValue } from "@/lib/constants";

function toNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}

const exerciseSelect = { select: { id: true, name: true, muscleGroup: true, equipment: true } } as const;

const fullProgramInclude = {
  days: {
    orderBy: { order: "asc" as const },
    include: { exercises: { orderBy: { order: "asc" as const }, include: { exercise: exerciseSelect } } },
  },
};

const fullSessionInclude = {
  exercises: {
    orderBy: { order: "asc" as const },
    include: { exercise: exerciseSelect, sets: { orderBy: { setNumber: "asc" as const } } },
  },
};

export const dataPortabilityService = {
  async exportData(userId: string): Promise<ExportData> {
    const [user, customExercises, programs, sessions, bodyWeightEntries, weightGoals] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { unitPreference: true, heightCm: true } }),
      prisma.exercise.findMany({
        where: { userId, isCustom: true },
        select: { name: true, muscleGroup: true, equipment: true },
      }),
      prisma.program.findMany({ where: { userId }, include: fullProgramInclude }),
      prisma.workoutSession.findMany({ where: { userId }, include: fullSessionInclude }),
      prisma.bodyWeightEntry.findMany({ where: { userId } }),
      prisma.weightGoal.findMany({ where: { userId } }),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: {
        unitPreference: user?.unitPreference,
        heightCm: user?.heightCm ?? null,
      },
      exercises: customExercises.map((e) => ({
        name: e.name,
        muscleGroup: e.muscleGroup as MuscleGroupValue,
        equipment: e.equipment,
      })),
      programs: programs.map((program) => ({
        name: program.name,
        description: program.description,
        status: program.status,
        days: program.days.map((day) => ({
          order: day.order,
          name: day.name,
          label: day.label,
          exercises: day.exercises.map((pe) => ({
            order: pe.order,
            exercise: {
              name: pe.exercise.name,
              muscleGroup: pe.exercise.muscleGroup as MuscleGroupValue,
            },
            targetSets: pe.targetSets,
            targetRepsMin: pe.targetRepsMin,
            targetRepsMax: pe.targetRepsMax,
            targetWeight: toNumber(pe.targetWeight),
            restSeconds: pe.restSeconds,
            notes: pe.notes,
          })),
        })),
      })),
      workoutSessions: sessions.map((session) => ({
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        status: session.status,
        notes: session.notes,
        exercises: session.exercises.map((se) => ({
          order: se.order,
          exercise: {
            name: se.exercise.name,
            muscleGroup: se.exercise.muscleGroup as MuscleGroupValue,
          },
          targetSets: se.targetSets,
          targetRepsMin: se.targetRepsMin,
          targetRepsMax: se.targetRepsMax,
          targetWeight: toNumber(se.targetWeight),
          restSeconds: se.restSeconds,
          notes: se.notes,
          sets: se.sets.map((set) => ({
            setNumber: set.setNumber,
            weight: toNumber(set.weight),
            reps: set.reps,
            rpe: toNumber(set.rpe),
            notes: set.notes,
            isWarmup: set.isWarmup,
            completed: set.completed,
            completedAt: set.completedAt?.toISOString() ?? null,
          })),
        })),
      })),
      bodyWeightEntries: bodyWeightEntries.map((entry) => ({
        date: entry.date.toISOString().slice(0, 10),
        weight: Number(entry.weight),
        note: entry.note,
      })),
      weightGoals: weightGoals.map((goal) => ({
        targetWeight: Number(goal.targetWeight),
        targetDate: goal.targetDate?.toISOString().slice(0, 10) ?? null,
        achievedAt: goal.achievedAt?.toISOString() ?? null,
      })),
    };
  },

  async importData(userId: string, data: ExportData) {
    const visible = await exerciseRepository.findAllVisibleToUser(userId);
    const cache = new Map(visible.map((e) => [e.name.toLowerCase(), e.id]));

    async function resolveExerciseId(ref: { name: string; muscleGroup: MuscleGroupValue }, equipment?: string | null) {
      const key = ref.name.toLowerCase();
      const existing = cache.get(key);
      if (existing) return existing;
      const created = await exerciseRepository.create(userId, {
        name: ref.name,
        muscleGroup: ref.muscleGroup,
        equipment: equipment ?? undefined,
      });
      cache.set(key, created.id);
      return created.id;
    }

    let exercisesCreated = 0;
    for (const exercise of data.exercises) {
      const key = exercise.name.toLowerCase();
      if (!cache.has(key)) {
        await resolveExerciseId(exercise, exercise.equipment);
        exercisesCreated++;
      }
    }

    let programsImported = 0;
    for (const program of data.programs) {
      await prisma.program.create({
        data: {
          userId,
          name: program.name,
          description: program.description,
          status: program.status ?? "ACTIVE",
          days: {
            create: await Promise.all(
              program.days.map(async (day) => ({
                order: day.order,
                name: day.name,
                label: day.label,
                exercises: {
                  create: await Promise.all(
                    day.exercises.map(async (pe) => ({
                      order: pe.order,
                      exerciseId: await resolveExerciseId(pe.exercise),
                      targetSets: pe.targetSets,
                      targetRepsMin: pe.targetRepsMin,
                      targetRepsMax: pe.targetRepsMax,
                      targetWeight: pe.targetWeight,
                      restSeconds: pe.restSeconds,
                      notes: pe.notes,
                    }))
                  ),
                },
              }))
            ),
          },
        },
      });
      programsImported++;
    }

    let sessionsImported = 0;
    for (const session of data.workoutSessions) {
      await prisma.workoutSession.create({
        data: {
          userId,
          status: session.status ?? "COMPLETED",
          startedAt: new Date(session.startedAt),
          completedAt: session.completedAt ? new Date(session.completedAt) : null,
          notes: session.notes,
          exercises: {
            create: await Promise.all(
              session.exercises.map(async (se) => ({
                order: se.order,
                exerciseId: await resolveExerciseId(se.exercise),
                targetSets: se.targetSets,
                targetRepsMin: se.targetRepsMin,
                targetRepsMax: se.targetRepsMax,
                targetWeight: se.targetWeight,
                restSeconds: se.restSeconds,
                notes: se.notes,
                sets: {
                  create: se.sets.map((set) => ({
                    setNumber: set.setNumber,
                    weight: set.weight,
                    reps: set.reps,
                    rpe: set.rpe,
                    notes: set.notes,
                    isWarmup: set.isWarmup ?? false,
                    completed: set.completed ?? false,
                    completedAt: set.completedAt ? new Date(set.completedAt) : null,
                  })),
                },
              }))
            ),
          },
        },
      });
      sessionsImported++;
    }

    let bodyWeightEntriesImported = 0;
    for (const entry of data.bodyWeightEntries) {
      await bodyWeightRepository.upsertEntry(userId, new Date(`${entry.date}T00:00:00.000Z`), entry.weight, entry.note ?? undefined);
      bodyWeightEntriesImported++;
    }

    let weightGoalsImported = 0;
    for (const goal of data.weightGoals) {
      await prisma.weightGoal.create({
        data: {
          userId,
          targetWeight: goal.targetWeight,
          targetDate: goal.targetDate ? new Date(`${goal.targetDate}T00:00:00.000Z`) : null,
          achievedAt: goal.achievedAt ? new Date(goal.achievedAt) : null,
        },
      });
      weightGoalsImported++;
    }

    if (data.profile.unitPreference) {
      await userRepository.updateUnitPreference(userId, data.profile.unitPreference);
    }
    if (data.profile.heightCm) {
      await bodyWeightRepository.updateUserHeight(userId, data.profile.heightCm);
    }

    return {
      exercisesCreated,
      programsImported,
      sessionsImported,
      bodyWeightEntriesImported,
      weightGoalsImported,
    };
  },
};
