import "dotenv/config";
import { PrismaClient, MuscleGroup } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const builtInExercises: { name: string; muscleGroup: MuscleGroup; equipment?: string }[] = [
  // Chest
  { name: "Développé couché barre", muscleGroup: "CHEST", equipment: "Barre" },
  { name: "Développé couché haltères", muscleGroup: "CHEST", equipment: "Haltères" },
  { name: "Développé incliné barre", muscleGroup: "CHEST", equipment: "Barre" },
  { name: "Développé incliné haltères", muscleGroup: "CHEST", equipment: "Haltères" },
  { name: "Développé décliné barre", muscleGroup: "CHEST", equipment: "Barre" },
  { name: "Écarté couché haltères", muscleGroup: "CHEST", equipment: "Haltères" },
  { name: "Écarté incliné haltères", muscleGroup: "CHEST", equipment: "Haltères" },
  { name: "Pec deck / Butterfly", muscleGroup: "CHEST", equipment: "Machine" },
  { name: "Écarté à la poulie vis-à-vis", muscleGroup: "CHEST", equipment: "Poulie" },
  { name: "Développé couché à la machine", muscleGroup: "CHEST", equipment: "Machine" },
  { name: "Pompes", muscleGroup: "CHEST", equipment: "Poids du corps" },
  { name: "Dips (pectoraux)", muscleGroup: "CHEST", equipment: "Poids du corps" },
  { name: "Pull-over haltère", muscleGroup: "CHEST", equipment: "Haltère" },

  // Back
  { name: "Tractions pronation", muscleGroup: "BACK", equipment: "Poids du corps" },
  { name: "Tractions supination", muscleGroup: "BACK", equipment: "Poids du corps" },
  { name: "Rowing barre", muscleGroup: "BACK", equipment: "Barre" },
  { name: "Rowing haltère un bras", muscleGroup: "BACK", equipment: "Haltère" },
  { name: "Tirage horizontal poulie", muscleGroup: "BACK", equipment: "Poulie" },
  { name: "Tirage vertical prise large", muscleGroup: "BACK", equipment: "Poulie" },
  { name: "Tirage vertical prise serrée", muscleGroup: "BACK", equipment: "Poulie" },
  { name: "Soulevé de terre", muscleGroup: "BACK", equipment: "Barre" },
  { name: "Rowing T-bar", muscleGroup: "BACK", equipment: "Barre" },
  { name: "Tirage poitrine machine", muscleGroup: "BACK", equipment: "Machine" },
  { name: "Rowing machine assis", muscleGroup: "BACK", equipment: "Machine" },
  { name: "Hyperextensions", muscleGroup: "BACK", equipment: "Poids du corps" },
  { name: "Shrugs barre", muscleGroup: "BACK", equipment: "Barre" },

  // Shoulders
  { name: "Développé militaire barre", muscleGroup: "SHOULDERS", equipment: "Barre" },
  { name: "Développé militaire haltères", muscleGroup: "SHOULDERS", equipment: "Haltères" },
  { name: "Développé Arnold", muscleGroup: "SHOULDERS", equipment: "Haltères" },
  { name: "Élévations latérales haltères", muscleGroup: "SHOULDERS", equipment: "Haltères" },
  { name: "Élévations latérales poulie", muscleGroup: "SHOULDERS", equipment: "Poulie" },
  { name: "Élévations frontales haltères", muscleGroup: "SHOULDERS", equipment: "Haltères" },
  { name: "Oiseau / Élévations arrière haltères", muscleGroup: "SHOULDERS", equipment: "Haltères" },
  { name: "Face pull", muscleGroup: "SHOULDERS", equipment: "Poulie" },
  { name: "Développé épaules machine", muscleGroup: "SHOULDERS", equipment: "Machine" },
  { name: "Rowing menton", muscleGroup: "SHOULDERS", equipment: "Barre" },

  // Biceps
  { name: "Curl barre", muscleGroup: "BICEPS", equipment: "Barre" },
  { name: "Curl haltères", muscleGroup: "BICEPS", equipment: "Haltères" },
  { name: "Curl marteau", muscleGroup: "BICEPS", equipment: "Haltères" },
  { name: "Curl incliné haltères", muscleGroup: "BICEPS", equipment: "Haltères" },
  { name: "Curl pupitre (Scott)", muscleGroup: "BICEPS", equipment: "Barre EZ" },
  { name: "Curl poulie basse", muscleGroup: "BICEPS", equipment: "Poulie" },
  { name: "Curl concentré", muscleGroup: "BICEPS", equipment: "Haltère" },
  { name: "Curl barre EZ", muscleGroup: "BICEPS", equipment: "Barre EZ" },

  // Triceps
  { name: "Extension poulie haute (pushdown)", muscleGroup: "TRICEPS", equipment: "Poulie" },
  { name: "Extension poulie corde", muscleGroup: "TRICEPS", equipment: "Poulie" },
  { name: "Barre au front (skull crusher)", muscleGroup: "TRICEPS", equipment: "Barre EZ" },
  { name: "Développé couché prise serrée", muscleGroup: "TRICEPS", equipment: "Barre" },
  { name: "Dips triceps", muscleGroup: "TRICEPS", equipment: "Poids du corps" },
  { name: "Extension nuque haltère", muscleGroup: "TRICEPS", equipment: "Haltère" },
  { name: "Kickback haltère", muscleGroup: "TRICEPS", equipment: "Haltère" },
  { name: "Extension triceps machine", muscleGroup: "TRICEPS", equipment: "Machine" },

  // Forearms
  { name: "Curl poignet barre", muscleGroup: "FOREARMS", equipment: "Barre" },
  { name: "Curl poignet inversé", muscleGroup: "FOREARMS", equipment: "Barre" },
  { name: "Extension poignet haltère", muscleGroup: "FOREARMS", equipment: "Haltère" },
  { name: "Enroulement de barre (wrist roller)", muscleGroup: "FOREARMS", equipment: "Wrist roller" },
  { name: "Farmer's walk", muscleGroup: "FOREARMS", equipment: "Haltères" },
  { name: "Préhension avec pince", muscleGroup: "FOREARMS", equipment: "Pince de préhension" },

  // Quadriceps
  { name: "Squat barre", muscleGroup: "QUADRICEPS", equipment: "Barre" },
  { name: "Front squat", muscleGroup: "QUADRICEPS", equipment: "Barre" },
  { name: "Presse à cuisses", muscleGroup: "QUADRICEPS", equipment: "Machine" },
  { name: "Fentes haltères", muscleGroup: "QUADRICEPS", equipment: "Haltères" },
  { name: "Fentes bulgares", muscleGroup: "QUADRICEPS", equipment: "Haltères" },
  { name: "Leg extension", muscleGroup: "QUADRICEPS", equipment: "Machine" },
  { name: "Hack squat", muscleGroup: "QUADRICEPS", equipment: "Machine" },
  { name: "Squat gobelet", muscleGroup: "QUADRICEPS", equipment: "Haltère" },

  // Hamstrings
  { name: "Soulevé de terre jambes tendues", muscleGroup: "HAMSTRINGS", equipment: "Barre" },
  { name: "Soulevé de terre roumain haltères", muscleGroup: "HAMSTRINGS", equipment: "Haltères" },
  { name: "Leg curl allongé", muscleGroup: "HAMSTRINGS", equipment: "Machine" },
  { name: "Leg curl assis", muscleGroup: "HAMSTRINGS", equipment: "Machine" },
  { name: "Good morning", muscleGroup: "HAMSTRINGS", equipment: "Barre" },
  { name: "Nordic curl", muscleGroup: "HAMSTRINGS", equipment: "Poids du corps" },

  // Glutes
  { name: "Hip thrust barre", muscleGroup: "GLUTES", equipment: "Barre" },
  { name: "Fentes marchées", muscleGroup: "GLUTES", equipment: "Haltères" },
  { name: "Kickback fessier poulie", muscleGroup: "GLUTES", equipment: "Poulie" },
  { name: "Abduction hanche machine", muscleGroup: "GLUTES", equipment: "Machine" },
  { name: "Pont fessier", muscleGroup: "GLUTES", equipment: "Poids du corps" },
  { name: "Squat sumo", muscleGroup: "GLUTES", equipment: "Haltère" },

  // Calves
  { name: "Mollets debout", muscleGroup: "CALVES", equipment: "Machine" },
  { name: "Mollets assis", muscleGroup: "CALVES", equipment: "Machine" },
  { name: "Mollets à la presse", muscleGroup: "CALVES", equipment: "Machine" },
  { name: "Mollets unilatéral haltère", muscleGroup: "CALVES", equipment: "Haltère" },

  // Core
  { name: "Crunch", muscleGroup: "CORE", equipment: "Poids du corps" },
  { name: "Planche", muscleGroup: "CORE", equipment: "Poids du corps" },
  { name: "Relevé de jambes suspendu", muscleGroup: "CORE", equipment: "Barre de traction" },
  { name: "Russian twist", muscleGroup: "CORE", equipment: "Poids du corps" },
  { name: "Gainage latéral", muscleGroup: "CORE", equipment: "Poids du corps" },
  { name: "Roue abdominale", muscleGroup: "CORE", equipment: "Roue abdominale" },
  { name: "Crunch câble", muscleGroup: "CORE", equipment: "Poulie" },
  { name: "Mountain climbers", muscleGroup: "CORE", equipment: "Poids du corps" },
  { name: "Sit-up lesté", muscleGroup: "CORE", equipment: "Disque" },
];

async function main() {
  // Built-ins are identified by userId === null. Re-seeding replaces the whole
  // catalog; this will fail on a FK constraint if any program/session already
  // references one of these rows — acceptable for the current early stage
  // (no real usage data yet), revisit if reseeding a populated database.
  await prisma.exercise.deleteMany({ where: { userId: null } });

  await prisma.exercise.createMany({
    data: builtInExercises.map((exercise) => ({ ...exercise, isCustom: false })),
  });

  console.log(`Seeded ${builtInExercises.length} built-in exercises.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
