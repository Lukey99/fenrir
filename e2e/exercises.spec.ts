import { test, expect } from "@playwright/test";
import { registerNewUser } from "./fixtures";

test.describe("Base d'exercices", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/exercises");
  });

  test("affiche les exercices intégrés de base", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Base d'exercices" })).toBeVisible();
    await expect(page.getByText(/exercices disponibles/)).toBeVisible();
    // Le seed intègre un exercice pectoraux classique.
    await expect(page.getByText("Développé couché", { exact: false }).first()).toBeVisible();
  });

  test("la recherche filtre la liste", async ({ page }) => {
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché");
    await expect(page.getByText("Développé couché", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Squat", { exact: false })).toHaveCount(0);
  });

  test("le filtre par groupe musculaire fonctionne", async ({ page }) => {
    await page.getByRole("button", { name: "Dos" }).click();
    await expect(page.getByText(/exercices disponibles/)).toBeVisible();
    // Un exercice pectoraux connu ne doit plus apparaître une fois filtré sur "Dos".
    await expect(page.getByText("Développé couché", { exact: false })).toHaveCount(0);
  });

  test("créer un exercice personnalisé l'ajoute à la liste avec le badge Perso", async ({ page }) => {
    await page.getByRole("button", { name: "Nouvel exercice" }).click();

    await page.getByLabel("Nom").fill("Tirage menton custom");
    await page.getByLabel("Groupe musculaire").click();
    await page.getByRole("option", { name: "Épaules" }).click();
    await page.getByLabel("Matériel (optionnel)").fill("Câble");

    await page.getByRole("button", { name: "Créer l'exercice" }).click();

    await expect(page.getByText("Tirage menton custom").first()).toBeVisible();
    await expect(page.getByText("Perso", { exact: true })).toBeVisible();
  });
});
