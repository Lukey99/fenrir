import { test, expect } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

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
