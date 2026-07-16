import { test, expect } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

test.describe("Export PDF d'un programme", () => {
  test("le bouton Exporter en PDF ouvre une vue imprimable avec le jour et l'exercice", async ({
    page,
  }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme Export",
      dayName: "Jour Export",
      exerciseName: "Développé couché barre",
    });

    const [printPage] = await Promise.all([
      page.context().waitForEvent("page"),
      page.getByRole("button", { name: "Exporter en PDF" }).click(),
    ]);
    await printPage.waitForLoadState();

    await expect(printPage.getByRole("heading", { name: "Programme Export" })).toBeVisible();
    await expect(printPage.getByRole("heading", { name: "Jour Export" })).toBeVisible();
    await expect(printPage.getByText("Développé couché barre", { exact: true })).toBeVisible();
    await expect(printPage).toHaveURL(/\/programs\/.+\/print$/);
  });

  test("la vue imprimable regroupe les supersets", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/programs");
    await page.getByRole("button", { name: "Nouveau programme" }).click();
    await page.getByLabel("Nom").fill("Programme Export Superset");
    await page.getByRole("button", { name: "Créer le programme" }).click();
    await page.getByRole("link", { name: "Programme Export Superset" }).click();

    await page.getByRole("button", { name: "Ajouter un jour" }).click();
    await page.getByLabel("Nom").fill("Jour Superset Export");
    await page.getByRole("button", { name: "Enregistrer" }).click();

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

    const [printPage] = await Promise.all([
      page.context().waitForEvent("page"),
      page.getByRole("button", { name: "Exporter en PDF" }).click(),
    ]);
    await printPage.waitForLoadState();

    await expect(printPage.getByText("Superset — 2 exercices enchaînés")).toBeVisible();
  });

  test("accéder à la vue imprimable d'un programme qui n'est pas le sien renvoie une 404", async ({
    page,
    browser,
  }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme Privé",
      dayName: "Jour Privé",
      exerciseName: "Squat barre",
    });
    const printUrl = page.url().replace(/\/programs\/([^/]+).*/, "/programs/$1/print");

    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await registerNewUser(otherPage, { emailPrefix: "e2e-other" });
    const response = await otherPage.goto(printUrl);
    expect(response?.status()).toBe(404);
    await otherContext.close();
  });
});
