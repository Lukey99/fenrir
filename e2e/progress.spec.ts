import { test, expect } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

test.describe("Progression", () => {
  let sessionId = "";

  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme Progression",
      dayName: "Jour Progression",
      exerciseName: "Développé couché barre",
    });

    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
    sessionId = new URL(page.url()).pathname.split("/workout/")[1];

    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids (kg)").fill("80");
    await page.getByLabel("Reps").fill("10");
    await page.getByRole("button", { name: "Valider la série" }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();

    await page.getByRole("button", { name: "Arrêter la séance" }).click();
    await page.getByRole("button", { name: "Terminer", exact: true }).click();
    await expect(page.getByText("Séance terminée !")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Fermer" }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });
  });

  test("la page progression liste le programme entraîné, qui mène à l'exercice et son 1RM", async ({
    page,
  }) => {
    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: "Progression" })).toBeVisible();
    // .first(): cf. plus bas dans ce fichier — le prefetch/segment-cache de
    // Next.js peut laisser une copie cachée de la route en double dans le DOM.
    await expect(page.getByText("Programme Progression", { exact: true }).first()).toBeVisible();

    await page.getByText("Programme Progression", { exact: true }).first().click();
    await expect(page).toHaveURL(/\/progress\/program\/.+/);

    // Le programme regroupe les séances par type (jour de programme), pas par instance datée.
    await expect(page.getByRole("heading", { name: "Types de séances" })).toBeVisible();
    await expect(page.getByText("Jour Progression", { exact: true })).toBeVisible();
    await expect(page.getByText(/1 séance · dernière fois/)).toBeVisible();

    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();
    // Epley 1RM : 80 * (1 + 10/30) = 106.7 kg
    await expect(page.getByText("106.7 kg")).toBeVisible();
  });

  test("la page détail d'un exercice affiche stats et graphiques", async ({ page }) => {
    await page.goto("/progress");
    await page.getByText("Programme Progression", { exact: true }).first().click();
    await expect(page).toHaveURL(/\/progress\/program\/.+/);

    await page.getByText("Développé couché barre", { exact: true }).click();

    await expect(page).toHaveURL(/\/progress\/(?!program).+/);
    await expect(page.getByRole("heading", { name: "Développé couché barre" })).toBeVisible();
    await expect(page.getByText("Meilleur poids")).toBeVisible();

    await expect(page.getByRole("link", { name: "Semaine" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tout" })).toBeVisible();

    // le graphique combiné (1RM + Poids) doit avoir rendu au moins un SVG.
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();

    await page.getByRole("link", { name: "Semaine" }).click();
    await expect(page).toHaveURL(/range=week/);
  });

  test("cliquer sur un type de séance ouvre le dashboard de sa dernière séance", async ({ page }) => {
    await page.goto("/progress");
    await page.getByText("Programme Progression", { exact: true }).first().click();
    await expect(page).toHaveURL(/\/progress\/program\/.+/, { timeout: 15_000 });

    await page.getByText("Jour Progression", { exact: true }).click();
    // La séance vit sous /progress/workout/:id (et non /workout/:id) pour que
    // le bouton retour ramène naturellement au dashboard du programme.
    await expect(page).toHaveURL(new RegExp(`/progress/workout/${sessionId}`), { timeout: 15_000 });

    await expect(page.getByRole("heading", { name: "Jour Progression" })).toBeVisible();

    // L'exercice de la séance est sélectionné par défaut et affiche ses stats/graphiques.
    await expect(page.getByRole("button", { name: "Développé couché barre" })).toBeVisible();
    // .filter({ visible: true }): le contenu existe en double dans le DOM (variante
    // desktop en colonnes + variante mobile en carousel, l'une des deux masquée en CSS
    // selon le viewport) — getByText ne respecte pas la visibilité contrairement à getByRole.
    await expect(page.getByText("106.7 kg").filter({ visible: true })).toBeVisible();
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();

    await page.getByRole("button", { name: "Programme Progression" }).click();
    await expect(page).toHaveURL(/\/progress\/program\/.+/, { timeout: 15_000 });
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
    // .first(): Next.js's prefetch/segment cache can keep a hidden, inert
    // prerendered copy of the route in the DOM (from the sidebar Link
    // prefetching /progress) alongside the real one — same pattern as
    // elsewhere in this suite for text that isn't guaranteed unique in the DOM.
    await expect(page.getByText("Pas encore d'historique").first()).toBeVisible();

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
    // Une séance libre (sans programme) apparaît sous "Séances libres".
    await expect(page.getByText("Séances libres", { exact: true })).toBeVisible();
    await page.getByText("Séances libres", { exact: true }).click();
    await expect(page).toHaveURL(/\/progress\/program\/free/);
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
    await page.getByText("Programme Manuel", { exact: true }).click();
    await expect(page).toHaveURL(/\/progress\/program\/.+/);
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

test.describe("Dashboard d'une séance", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
  });

  test("sélectionner un autre exercice dans le dashboard de la séance en affiche les stats", async ({
    page,
  }) => {
    await page.goto("/progress/add");
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché barre");
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByPlaceholder("Poids (kg)").first().fill("80");
    await page.getByPlaceholder("Reps").first().fill("10");

    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Squat barre");
    await page.getByText("Squat barre", { exact: true }).click();
    const weightInputs = page.getByPlaceholder("Poids (kg)");
    const repInputs = page.getByPlaceholder("Reps");
    const count = await weightInputs.count();
    await weightInputs.nth(count - 1).fill("60");
    await repInputs.nth(count - 1).fill("5");

    await page.getByRole("button", { name: "Enregistrer la séance" }).click();
    await expect(page).toHaveURL(/\/progress$/, { timeout: 15_000 });

    await page.getByText("Séances libres", { exact: true }).click();
    await expect(page).toHaveURL(/\/progress\/program\/free/, { timeout: 15_000 });
    await page.getByText("Séance libre", { exact: true }).click();
    await expect(page).toHaveURL(/\/progress\/workout\/.+/, { timeout: 15_000 });

    // Développé couché barre est sélectionné par défaut (premier exercice de la séance).
    // .filter({ visible: true }): contenu dupliqué en DOM entre la variante desktop
    // (colonnes) et la variante mobile (carousel), l'une masquée en CSS selon le viewport.
    await expect(page.getByText("Pectoraux", { exact: true }).filter({ visible: true })).toBeVisible();
    // Epley 1RM : 80 * (1 + 10/30) = 106.7 kg
    await expect(page.getByText("106.7 kg").filter({ visible: true })).toBeVisible();

    await page.getByRole("button", { name: "Squat barre" }).click();
    await expect(page.getByText("Quadriceps", { exact: true }).filter({ visible: true })).toBeVisible();
    // Epley 1RM : 60 * (1 + 5/30) = 70 kg
    await expect(page.getByText("70 kg").filter({ visible: true })).toBeVisible();
  });
});
