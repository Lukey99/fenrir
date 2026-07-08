import { test, expect } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

test.describe("Progression", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme Progression",
      dayName: "Jour Progression",
      exerciseName: "Développé couché barre",
    });

    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });

    await page.getByPlaceholder("kg").first().fill("80");
    await page.getByPlaceholder("reps").first().fill("10");
    await page.getByRole("button", { name: "Marquer la série comme terminée" }).first().click();
    await expect(page.getByText(/1\/3 séries faites/)).toBeVisible();

    await page.getByRole("button", { name: "Terminer la séance" }).click();
    await page.getByRole("button", { name: "Terminer", exact: true }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });
  });

  test("la page progression liste l'exercice entraîné avec son 1RM", async ({ page }) => {
    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: "Progression" })).toBeVisible();
    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();
    // Epley 1RM : 80 * (1 + 10/30) = 106.7 kg
    await expect(page.getByText("106.7 kg")).toBeVisible();
  });

  test("la page détail d'un exercice affiche stats et graphiques", async ({ page }) => {
    await page.goto("/progress");
    await page.getByText("Développé couché barre", { exact: true }).click();

    await expect(page).toHaveURL(/\/progress\/.+/);
    await expect(page.getByRole("heading", { name: "Développé couché barre" })).toBeVisible();
    await expect(page.getByText("Meilleur poids")).toBeVisible();
    await expect(page.getByText("Volume total")).toBeVisible();

    await expect(page.getByRole("link", { name: "Semaine" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tout" })).toBeVisible();

    // le graphique Recharts doit avoir rendu au moins un SVG.
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();

    await page.getByRole("link", { name: "Semaine" }).click();
    await expect(page).toHaveURL(/range=week/);
  });
});

test.describe("Ajout manuel d'une séance passée", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
  });

  test("le bouton retour de la page d'ajout ramène à la progression sans enregistrer", async ({ page }) => {
    await page.goto("/progress");
    await page.getByRole("button", { name: "Ajouter une séance passée" }).click();
    await expect(page).toHaveURL(/\/progress\/add/);
    await expect(page.getByRole("heading", { name: "Ajouter une séance passée" })).toBeVisible();

    await page.getByRole("button", { name: "Progression" }).click();
    await expect(page).toHaveURL(/\/progress$/);
  });

  test("ajouter une séance libre passée (faite hors application) fait apparaître l'exercice dans la progression", async ({
    page,
  }) => {
    await page.goto("/progress");
    await expect(page.getByText("Pas encore d'historique")).toBeVisible();

    await page.getByRole("button", { name: "Ajouter une séance passée" }).click();
    await expect(page).toHaveURL(/\/progress\/add/);
    await page.getByLabel("Date").fill("2026-01-15");

    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché barre");
    await page.getByText("Développé couché barre", { exact: true }).click();

    await page.getByPlaceholder("Poids (kg)").first().fill("80");
    await page.getByPlaceholder("Reps").first().fill("10");

    await page.getByRole("button", { name: "Ajouter une série" }).click();
    await page.getByPlaceholder("Poids (kg)").nth(1).fill("82.5");
    await page.getByPlaceholder("Reps").nth(1).fill("8");

    await page.getByRole("button", { name: "Enregistrer la séance" }).click();

    await expect(page).toHaveURL(/\/progress$/, { timeout: 15_000 });
    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();
    // Epley 1RM sur la meilleure série (80kg x 10) : 80 * (1 + 10/30) = 106.7 kg
    await expect(page.getByText("106.7 kg")).toBeVisible();
  });

  test("choisir un programme dans l'ajout d'une séance passée pré-remplit les exercices du jour", async ({
    page,
  }) => {
    await createProgramWithExercise(page, {
      programName: "Programme Manuel",
      dayName: "Jour Push Manuel",
      exerciseName: "Développé couché barre",
    });

    await page.goto("/progress");
    await page.getByRole("button", { name: "Ajouter une séance passée" }).click();
    await page.getByLabel("Programme").selectOption({ label: "Programme Manuel — Jour Push Manuel" });

    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();

    await page.getByPlaceholder("Poids (kg)").first().fill("80");
    await page.getByPlaceholder("Reps").first().fill("10");

    await page.getByRole("button", { name: "Enregistrer la séance" }).click();

    await expect(page).toHaveURL(/\/progress$/, { timeout: 15_000 });
    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();
    // Epley 1RM : 80 * (1 + 10/30) = 106.7 kg
    await expect(page.getByText("106.7 kg")).toBeVisible();
  });

  test("les poids se pré-remplissent (poids cible du programme, poids déjà loggué, série suivante)", async ({
    page,
  }) => {
    // Historique : Squat barre déjà loggué à 60 kg lors d'une précédente séance manuelle.
    await page.goto("/progress/add");
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Squat barre");
    await page.getByText("Squat barre", { exact: true }).click();
    await page.getByPlaceholder("Poids (kg)").first().fill("60");
    await page.getByPlaceholder("Reps").first().fill("5");
    await page.getByRole("button", { name: "Enregistrer la séance" }).click();
    await expect(page).toHaveURL(/\/progress$/, { timeout: 15_000 });

    // Programme avec un poids cible de 100 kg pour Développé couché barre.
    await page.goto("/programs");
    await page.getByRole("button", { name: "Nouveau programme" }).click();
    await page.getByLabel("Nom").fill("Programme Poids Defaut");
    await page.getByRole("button", { name: "Créer le programme" }).click();
    await page.getByRole("link", { name: "Programme Poids Defaut" }).click();
    await page.getByRole("button", { name: "Ajouter un jour" }).click();
    await page.getByLabel("Nom").fill("Jour Push Defaut");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché barre");
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids cible (kg, optionnel)").fill("100");
    await page.getByRole("button", { name: "Ajouter" }).click();

    // Choisir ce jour dans l'ajout d'une séance passée : les séries doivent être pré-remplies à 100.
    await page.goto("/progress");
    await page.getByRole("button", { name: "Ajouter une séance passée" }).click();
    await page.getByLabel("Programme").selectOption({ label: "Programme Poids Defaut — Jour Push Defaut" });

    await expect(page.getByPlaceholder("Poids (kg)").first()).toHaveValue("100");

    // Une série ajoutée manuellement reprend le poids de la précédente.
    await page.getByRole("button", { name: "Ajouter une série" }).click();
    const dcWeightInputs = page.getByPlaceholder("Poids (kg)");
    const dcCount = await dcWeightInputs.count();
    await expect(dcWeightInputs.nth(dcCount - 1)).toHaveValue("100");

    // Ajouter Squat barre manuellement : doit reprendre le dernier poids loggué (60), pas la cible du programme.
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Squat barre");
    await page.getByText("Squat barre", { exact: true }).click();

    const allWeightInputs = page.getByPlaceholder("Poids (kg)");
    const total = await allWeightInputs.count();
    await expect(allWeightInputs.nth(total - 1)).toHaveValue("60");
  });
});
