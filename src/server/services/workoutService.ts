import { workoutRepository } from "@/server/repositories/workoutRepository";
import { programRepository } from "@/server/repositories/programRepository";
import { exerciseRepository } from "@/server/repositories/exerciseRepository";
import { workoutStatsRepository } from "@/server/repositories/workoutStatsRepository";
import { personalRecordRepository } from "@/server/repositories/personalRecordRepository";
import { NotFoundError } from "@/server/errors";
import { estimate1RM, dateKey } from "@/server/services/analytics";
import type {
  StartSessionInput,
  AddSessionExerciseInput,
  SessionExerciseActionInput,
  UpdateWorkoutSetInput,
  CreateManualSessionInput,
} from "@/server/validators/workout";

async function requireOwnedSession(id: string, userId: string) {
  const session = await workoutRepository.findFullSessionForUser(id, userId);
  if (!session) throw new NotFoundError("Séance introuvable.");
  return session;
}

async function requireOwnedSessionExercise(id: string, userId: string) {
  const sessionExercise = await workoutRepository.findSessionExerciseWithSession(id);
  if (!sessionExercise || sessionExercise.session.userId !== userId) {
    throw new NotFoundError("Exercice de séance introuvable.");
  }
  return sessionExercise;
}

async function requireOwnedSet(id: string, userId: string) {
  const set = await workoutRepository.findSetWithSession(id);
  if (!set || set.sessionExercise.session.userId !== userId) {
    throw new NotFoundError("Série introuvable.");
  }
  return set;
}

/** Last weight the user logged for this exercise, used to pre-fill new sets. */
async function getDefaultWeight(userId: string, exerciseId: string): Promise<number | null> {
  const last = await workoutStatsRepository.findLastCompletedSetForExercise(userId, exerciseId);
  return last?.weight ? Number(last.weight) : null;
}

/** If this set's estimated 1RM beats every PersonalRecord logged so far for
 * this exercise (or there isn't one yet), log it as a new record automatically
 * — surfacing it live during the set that earned it, instead of only
 * counting whatever the user remembers to log by hand afterward. */
async function maybeRecordNewPR(
  userId: string,
  exercise: { id: string; name: string },
  weight: number,
  reps: number
) {
  const estimated1RM = estimate1RM(weight, reps);
  const existing = await personalRecordRepository.findForExercise(userId, exercise.id);
  const bestKnown1RM = existing.reduce(
    (max, r) => Math.max(max, estimate1RM(Number(r.weight), r.reps)),
    0
  );
  if (estimated1RM <= bestKnown1RM) return null;

  await personalRecordRepository.create(userId, {
    exerciseId: exercise.id,
    weight,
    reps,
    achievedAt: new Date(`${dateKey(new Date())}T00:00:00.000Z`),
  });

  return {
    exerciseName: exercise.name,
    weight,
    reps,
    estimated1RM: Math.round(estimated1RM * 10) / 10,
  };
}

export const workoutService = {
  getDefaultWeights(userId: string) {
    return workoutStatsRepository.findLastWeightPerExerciseForUser(userId);
  },

  async start(userId: string, input: StartSessionInput) {
    if (!input.programDayId) {
      return workoutRepository.createSession(userId, null, []);
    }

    const day = await workoutRepository.findProgramDayForSnapshot(input.programDayId);
    if (!day || day.program.userId !== userId) {
      throw new NotFoundError("Jour de programme introuvable.");
    }

    // Batched: one query for every exercise's last weight, instead of one
    // findLastCompletedSetForExercise call per exercise in the day.
    const defaultWeights = await workoutStatsRepository.findLastWeightPerExerciseForUser(userId);

    const sessionExercises = day.exercises.map((pde) => {
      const targetWeight = pde.targetWeight ? Number(pde.targetWeight) : null;
      return {
        order: pde.order,
        exerciseId: pde.exerciseId,
        sourceProgramDayExerciseId: pde.id,
        targetSets: pde.targetSets,
        targetRepsMin: pde.targetRepsMin,
        targetRepsMax: pde.targetRepsMax,
        targetWeight,
        restSeconds: pde.restSeconds,
        notes: pde.notes,
        supersetGroup: pde.supersetGroup,
        defaultWeight: targetWeight ?? defaultWeights.get(pde.exerciseId) ?? null,
      };
    });

    return workoutRepository.createSession(userId, input.programDayId, sessionExercises);
  },

  get(id: string, userId: string) {
    return requireOwnedSession(id, userId);
  },

  async complete(id: string, userId: string) {
    await requireOwnedSession(id, userId);
    return workoutRepository.completeSession(id);
  },

  async remove(id: string, userId: string) {
    await requireOwnedSession(id, userId);
    await workoutRepository.deleteSession(id);
  },

  async createManual(userId: string, input: CreateManualSessionInput) {
    const startedAt = new Date(`${input.date}T12:00:00.000Z`);

    let day: Awaited<ReturnType<typeof workoutRepository.findProgramDayForSnapshot>> = null;
    if (input.programDayId) {
      day = await workoutRepository.findProgramDayForSnapshot(input.programDayId);
      if (!day || day.program.userId !== userId) {
        throw new NotFoundError("Jour de programme introuvable.");
      }
    }
    const dayExercisesById = new Map((day?.exercises ?? []).map((pde) => [pde.id, pde]));

    const exercises = await Promise.all(
      input.exercises.map(async (ex, index) => {
        const exercise = await exerciseRepository.findVisibleById(ex.exerciseId, userId);
        if (!exercise) throw new NotFoundError("Exercice introuvable.");

        const source = ex.sourceProgramDayExerciseId
          ? dayExercisesById.get(ex.sourceProgramDayExerciseId)
          : undefined;

        const reps = ex.sets
          .map((s) => s.reps)
          .filter((r): r is number => r != null && r > 0);

        return {
          order: index,
          exerciseId: ex.exerciseId,
          sourceProgramDayExerciseId: source?.id ?? null,
          targetSets: source?.targetSets ?? ex.sets.length,
          targetRepsMin: source?.targetRepsMin ?? (reps.length ? Math.min(...reps) : 1),
          targetRepsMax: source?.targetRepsMax ?? (reps.length ? Math.max(...reps) : 1),
          targetWeight: source?.targetWeight ? Number(source.targetWeight) : null,
          sets: ex.sets.map((s, i) => ({
            setNumber: i + 1,
            weight: s.weight ?? null,
            reps: s.reps ?? null,
          })),
        };
      })
    );

    return workoutRepository.createManualSession(
      userId,
      input.programDayId ?? null,
      startedAt,
      input.notes ?? null,
      exercises
    );
  },

  async addExercise(sessionId: string, userId: string, input: AddSessionExerciseInput) {
    const session = await requireOwnedSession(sessionId, userId);
    const exercise = await exerciseRepository.findVisibleById(input.exerciseId, userId);
    if (!exercise) throw new NotFoundError("Exercice introuvable.");

    const created = await workoutRepository.addExercise(sessionId, {
      exerciseId: input.exerciseId,
      targetSets: input.targetSets,
      targetRepsMin: input.targetRepsMin,
      targetRepsMax: input.targetRepsMax,
      restSeconds: input.restSeconds ?? null,
      notes: input.notes ?? null,
      defaultWeight: await getDefaultWeight(userId, input.exerciseId),
    });

    if (input.scope === "program" && session.programDayId) {
      await programRepository.createDayExercise(session.programDayId, {
        exerciseId: input.exerciseId,
        targetSets: input.targetSets,
        targetRepsMin: input.targetRepsMin,
        targetRepsMax: input.targetRepsMax,
        restSeconds: input.restSeconds,
        notes: input.notes,
      });
    }

    return created;
  },

  async applyExerciseAction(
    sessionExerciseId: string,
    userId: string,
    input: SessionExerciseActionInput
  ) {
    const sessionExercise = await requireOwnedSessionExercise(sessionExerciseId, userId);

    if (input.type === "swap") {
      const exercise = await exerciseRepository.findVisibleById(input.exerciseId, userId);
      if (!exercise) throw new NotFoundError("Exercice introuvable.");

      const updated = await workoutRepository.swapExercise(
        sessionExerciseId,
        input.exerciseId,
        sessionExercise.targetSets,
        await getDefaultWeight(userId, input.exerciseId)
      );

      if (input.scope === "program" && sessionExercise.sourceProgramDayExerciseId) {
        await programRepository.updateDayExerciseSource(
          sessionExercise.sourceProgramDayExerciseId,
          input.exerciseId
        );
      }

      return updated;
    }

    if (input.type === "skip") {
      const updated = await workoutRepository.setAction(sessionExerciseId, "SKIPPED");

      if (input.scope === "program" && sessionExercise.sourceProgramDayExerciseId) {
        await programRepository.deleteDayExercise(sessionExercise.sourceProgramDayExerciseId);
      }

      return updated;
    }

    return workoutRepository.setAction(sessionExerciseId, "ORIGINAL");
  },

  async addSet(sessionExerciseId: string, userId: string) {
    const sessionExercise = await requireOwnedSessionExercise(sessionExerciseId, userId);

    const lastSet = await workoutRepository.findLastWeightedSetInSessionExercise(sessionExerciseId);
    const weight = lastSet?.weight
      ? Number(lastSet.weight)
      : await getDefaultWeight(userId, sessionExercise.exerciseId);

    return workoutRepository.addSet(sessionExerciseId, weight);
  },

  async updateSet(id: string, userId: string, input: UpdateWorkoutSetInput) {
    const set = await requireOwnedSet(id, userId);
    const updated = await workoutRepository.updateSet(id, input);

    // Only worth checking at the moment a set is actually marked done (not
    // every keystroke on weight/reps, and not when un-checking) — matches
    // the one UI action (the checkmark) this is meant to react to.
    const weight = updated.weight != null ? Number(updated.weight) : null;
    const newRecord =
      input.completed === true && weight && updated.reps
        ? await maybeRecordNewPR(userId, set.sessionExercise.exercise, weight, updated.reps)
        : null;

    return { set: updated, newRecord };
  },

  async removeSet(id: string, userId: string) {
    await requireOwnedSet(id, userId);
    await workoutRepository.deleteSet(id);
  },
};
