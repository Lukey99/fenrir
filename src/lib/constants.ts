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
export const muscleGroupColorClasses: Record<MuscleGroupValue, string> = {
  CHEST: "bg-muscle-chest/12 text-muscle-chest",
  BACK: "bg-muscle-back/12 text-muscle-back",
  SHOULDERS: "bg-muscle-shoulders/12 text-muscle-shoulders",
  BICEPS: "bg-muscle-biceps/12 text-muscle-biceps",
  TRICEPS: "bg-muscle-triceps/12 text-muscle-triceps",
  FOREARMS: "bg-muscle-forearms/12 text-muscle-forearms",
  QUADRICEPS: "bg-muscle-quadriceps/12 text-muscle-quadriceps",
  HAMSTRINGS: "bg-muscle-hamstrings/12 text-muscle-hamstrings",
  GLUTES: "bg-muscle-glutes/12 text-muscle-glutes",
  CALVES: "bg-muscle-calves/12 text-muscle-calves",
  CORE: "bg-muscle-core/12 text-muscle-core",
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
