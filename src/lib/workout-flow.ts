import type { SessionExerciseDTO } from "@/types/workout"

export type WorkoutStep =
  | { kind: "picker" }
  | { kind: "logging"; sessionExerciseId: string }
  | { kind: "resting"; sessionExerciseId: string; seconds: number }
  | { kind: "completing" }
  | { kind: "recap" }

/**
 * After a rest period ends (naturally or skipped), decides whether to stay on
 * the same exercise (more incomplete sets left) or return to the exercise
 * picker (this exercise is fully done). Kept as a single pure function since
 * it's the one place this rule lives — everything else just calls it.
 */
export function getNextStep(exercise: SessionExerciseDTO): WorkoutStep {
  const hasIncompleteSet = exercise.sets.some((set) => !set.completed)
  return hasIncompleteSet
    ? { kind: "logging", sessionExerciseId: exercise.id }
    : { kind: "picker" }
}
