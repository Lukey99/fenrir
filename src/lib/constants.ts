// Plain literals on purpose (not imported from @/generated/prisma) so this
// file stays safe to import from client components — pulling in the
// generated Prisma client here would drag its Node-only runtime into the
// browser bundle.

export const muscleGroupOrder = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "FOREARMS",
  "QUADRICEPS",
  "HAMSTRINGS",
  "GLUTES",
  "CALVES",
  "CORE",
] as const;

export type MuscleGroupValue = (typeof muscleGroupOrder)[number];

export const muscleGroupLabels: Record<MuscleGroupValue, string> = {
  CHEST: "Pectoraux",
  BACK: "Dos",
  SHOULDERS: "Épaules",
  BICEPS: "Biceps",
  TRICEPS: "Triceps",
  FOREARMS: "Avant-bras",
  QUADRICEPS: "Quadriceps",
  HAMSTRINGS: "Ischio-jambiers",
  GLUTES: "Fessiers",
  CALVES: "Mollets",
  CORE: "Core",
};

// Each muscle group's categorical color, exposed as `--muscle-*` tokens in
// globals.css (validated with the dataviz skill's palette validator). Class
// names are written out in full (never templated) so Tailwind's static scan
// picks them up.
// The background tint keeps the vivid, CVD-validated categorical color; the
// text uses the darker "-ink" variant of that same color so it clears WCAG
// AA contrast against the tint (the vivid color alone reads as low as 2:1).
export const muscleGroupColorClasses: Record<MuscleGroupValue, string> = {
  CHEST: "bg-muscle-chest/12 text-muscle-chest-ink",
  BACK: "bg-muscle-back/12 text-muscle-back-ink",
  SHOULDERS: "bg-muscle-shoulders/12 text-muscle-shoulders-ink",
  BICEPS: "bg-muscle-biceps/12 text-muscle-biceps-ink",
  TRICEPS: "bg-muscle-triceps/12 text-muscle-triceps-ink",
  FOREARMS: "bg-muscle-forearms/12 text-muscle-forearms-ink",
  QUADRICEPS: "bg-muscle-quadriceps/12 text-muscle-quadriceps-ink",
  HAMSTRINGS: "bg-muscle-hamstrings/12 text-muscle-hamstrings-ink",
  GLUTES: "bg-muscle-glutes/12 text-muscle-glutes-ink",
  CALVES: "bg-muscle-calves/12 text-muscle-calves-ink",
  CORE: "bg-muscle-core/12 text-muscle-core-ink",
};

// Broader, user-facing groupings on top of the muscle group taxonomy above —
// used by the Records page, where "Biceps"/"Triceps"/"Avant-bras" reading as
// three separate categories would fragment a single "Bras" record list.
export const muscleCategoryOrder = ["CHEST", "BACK", "SHOULDERS", "ARMS", "LEGS", "CORE"] as const;

export type MuscleCategoryValue = (typeof muscleCategoryOrder)[number];

export const muscleCategoryLabels: Record<MuscleCategoryValue, string> = {
  CHEST: "Poitrine",
  BACK: "Dos",
  SHOULDERS: "Épaules",
  ARMS: "Bras",
  LEGS: "Jambes",
  CORE: "Core",
};

export const muscleGroupToCategory: Record<MuscleGroupValue, MuscleCategoryValue> = {
  CHEST: "CHEST",
  BACK: "BACK",
  SHOULDERS: "SHOULDERS",
  BICEPS: "ARMS",
  TRICEPS: "ARMS",
  FOREARMS: "ARMS",
  QUADRICEPS: "LEGS",
  HAMSTRINGS: "LEGS",
  GLUTES: "LEGS",
  CALVES: "LEGS",
  CORE: "CORE",
};

export const muscleGroupBorderClasses: Record<MuscleGroupValue, string> = {
  CHEST: "border-muscle-chest/30",
  BACK: "border-muscle-back/30",
  SHOULDERS: "border-muscle-shoulders/30",
  BICEPS: "border-muscle-biceps/30",
  TRICEPS: "border-muscle-triceps/30",
  FOREARMS: "border-muscle-forearms/30",
  QUADRICEPS: "border-muscle-quadriceps/30",
  HAMSTRINGS: "border-muscle-hamstrings/30",
  GLUTES: "border-muscle-glutes/30",
  CALVES: "border-muscle-calves/30",
  CORE: "border-muscle-core/30",
};
