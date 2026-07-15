import { test, expect, type Page } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

/**
 * Creates a program day with two exercises grouped into a superset, then
 * starts a session from it. Mirrors the grouping UI flow exercised in
 * programs.spec.ts, but here as setup for the live-tracker behavior.
 */
async function createProgramWithSupersetAndStartSession(page: Page) {
  await registerNewUser(page);
  await page.goto("/programs");
  await page.getByRole("button", { name: "Nouveau programme" }).click();
  await page.getByLabel("Nom").fill("Programme Superset Tracker");
  await page.getByRole("button", { name: "Créer le programme" }).click();
  await page.getByRole("link", { name: "Programme Superset Tracker" }).click();
  await expect(page).toHaveURL(/\/programs\/.+/);

  await page.getByRole("button", { name: "Ajouter un jour" }).click();
  await page.getByLabel("Nom").fill("Jour Superset");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("heading", { name: "Jour Superset", level: 2 })).toBeVisible();

  for (const name of ["Développé couché barre", "Curl haltères"]) {
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill(name);
    await page.getByText(name, { exact: true }).click();
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }

  await page.getByRole("button", { name: "Grouper en superset" }).click();
  await page
    .getByRole("checkbox", { name: "Sélectionner Développé couché barre pour le superset" })
    .check();
  await page.getByRole("checkbox", { name: "Sélectionner Curl haltères pour le superset" }).check();
  await page.getByRole("button", { name: "Créer le superset" }).click();
  await expect(page.getByText("Superset — 2 exercices enchaînés")).toBeVisible();

  await page.getByRole("button", { name: "Démarrer" }).click();
  await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
}

test.describe("Tracker de séance", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme Workout",
      dayName: "Jour Full Body",
      exerciseName: "Développé couché barre",
    });
    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
  });

  test("démarrer une séance affiche l'exercice programmé", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Développé couché barre" })).toBeVisible();
    await expect(page.getByText(/0\/3 séries faites/)).toBeVisible();
  });

  test("logger une série et la marquer comme terminée", async ({ page }) => {
    await page.getByPlaceholder("kg").first().fill("80");
    await page.getByPlaceholder("reps").first().fill("10");
    await page.getByPlaceholder("RPE").first().fill("8");
    await page.getByPlaceholder("RPE").first().blur();

    await page.getByRole("button", { name: "Marquer la série comme terminée" }).first().click();
    await expect(page.getByText(/1\/3 séries faites/)).toBeVisible();
  });

  test("compléter une série qui bat le record existant l'enregistre et l'annonce", async ({ page }) => {
    await page.getByPlaceholder("kg").first().fill("100");
    await page.getByPlaceholder("reps").first().fill("5");
    await page.getByRole("button", { name: "Marquer la série comme terminée" }).first().click();

    await expect(page.getByText(/Nouveau record.*Développé couché barre/)).toBeVisible();

    await page.goto("/records");
    await expect(page.getByText("100 kg × 5")).toBeVisible();
  });

  test("compléter une série qui ne bat pas le record existant ne crée rien", async ({ page }) => {
    await page.getByPlaceholder("kg").first().fill("100");
    await page.getByPlaceholder("reps").first().fill("5");
    await page.getByRole("button", { name: "Marquer la série comme terminée" }).first().click();
    await expect(page.getByText(/Nouveau record/)).toBeVisible();
    // Let the first toast fully auto-dismiss (sonner's default ~4s) so it
    // can't be mistaken for a (non-existent) second one below.
    await expect(page.getByText(/Nouveau record/)).toHaveCount(0, { timeout: 8000 });

    // Deuxième série, plus faible — ne doit pas déclencher de nouveau record.
    await page.getByPlaceholder("kg").nth(1).fill("60");
    await page.getByPlaceholder("reps").nth(1).fill("5");
    await page.getByRole("button", { name: "Marquer la série comme terminée" }).nth(1).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Nouveau record/)).toHaveCount(0);

    await page.goto("/records");
    await expect(page.getByText("60 kg × 5")).toHaveCount(0);
  });

  test("ajouter une série supplémentaire", async ({ page }) => {
    await expect(page.getByText(/0\/3 séries faites/)).toBeVisible();
    await page.getByRole("button", { name: "Ajouter une série" }).click();
    await expect(page.getByText(/0\/4 séries faites/)).toBeVisible();
  });

  test("remplacer un exercice", async ({ page }) => {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Remplacer" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Squat barre");
    await page.getByText("Squat barre", { exact: true }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(page.getByRole("heading", { name: "Squat barre" })).toBeVisible();
    await expect(page.getByText("Remplacé", { exact: true })).toBeVisible();
  });

  test("ignorer puis restaurer un exercice", async ({ page }) => {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Ignorer" }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(page.getByText("Ignoré", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Restaurer" }).click();
    await expect(page.getByText("Ignoré", { exact: true })).toHaveCount(0);
  });

  test("ajouter un exercice libre à la séance (bouton Ajouter)", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Curl haltères");
    await page.getByText("Curl haltères", { exact: true }).click();
    await page.getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByRole("heading", { name: "Curl haltères" })).toBeVisible();
    await expect(page.getByText("Ajouté", { exact: true })).toBeVisible();
  });

  test("terminer la séance redirige et confirme", async ({ page }) => {
    await page.getByRole("button", { name: "Terminer la séance" }).click();
    await page.getByRole("button", { name: "Terminer", exact: true }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });
  });

  test("supprimer une séance (démarrée par accident) redirige et la retire de l'historique", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Supprimer la séance" }).click();
    await page.getByRole("button", { name: "Supprimer", exact: true }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });

    await page.goto("/dashboard");
    await expect(page.getByText("Jour Full Body")).toHaveCount(0);
  });

  test("le poids se pré-remplit automatiquement (série suivante puis séance suivante)", async ({
    page,
  }) => {
    await page.getByPlaceholder("kg").first().fill("80");
    await page.getByPlaceholder("reps").first().fill("10");
    await page.getByRole("button", { name: "Marquer la série comme terminée" }).first().click();
    await expect(page.getByText(/1\/3 séries faites/)).toBeVisible();

    // Une nouvelle série ajoutée dans la même séance reprend le dernier poids saisi.
    await page.getByRole("button", { name: "Ajouter une série" }).click();
    await expect(page.getByPlaceholder("kg").nth(3)).toHaveValue("80");

    await page.getByRole("button", { name: "Terminer la séance" }).click();
    await page.getByRole("button", { name: "Terminer", exact: true }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });

    // Une toute nouvelle séance sur le même exercice reprend le dernier poids loggé.
    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
    await expect(page.getByPlaceholder("kg").first()).toHaveValue("80");
  });
});

test.describe("Superset dans le tracker de séance", () => {
  test.beforeEach(async ({ page }) => {
    await createProgramWithSupersetAndStartSession(page);
  });

  test("le superset s'affiche groupé et le repos n'apparaît qu'après le dernier exercice", async ({
    page,
  }) => {
    await expect(
      page.getByText("Superset — enchaîne les exercices sans repos entre eux")
    ).toBeVisible();

    // Compléter une série sur le PREMIER exercice du groupe : pas de minuteur de repos.
    await page.getByPlaceholder("kg").first().fill("80");
    await page.getByPlaceholder("reps").first().fill("10");
    await page.getByRole("button", { name: "Marquer la série comme terminée" }).first().click();
    await expect(page.getByText(/1\/6 séries faites/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ajouter 15 secondes" })).toHaveCount(0);

    // Compléter une série sur le DERNIER exercice du groupe : le minuteur apparaît.
    await page.getByPlaceholder("kg").nth(3).fill("40");
    await page.getByPlaceholder("reps").nth(3).fill("12");
    await page.getByRole("button", { name: "Marquer la série comme terminée" }).nth(3).click();
    await expect(page.getByText(/2\/6 séries faites/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ajouter 15 secondes" })).toBeVisible();
  });
});
