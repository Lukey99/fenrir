import { test, expect } from "@playwright/test";
import { registerNewUser } from "./fixtures";

test.describe("Suivi du poids de corps", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/bodyweight");
  });

  test("ajouter une pesée l'affiche dans les stats et l'historique", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter une pesée" }).click();
    await page.getByLabel("Poids (kg)").fill("82,5");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("82.5 kg").first()).toBeVisible();
    await expect(page.getByText("Dernière pesée")).toBeVisible();
  });

  test("renseigner sa taille fait apparaître l'IMC", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter une pesée" }).click();
    await page.getByLabel("Poids (kg)").fill("80");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("Renseigne ta taille pour voir ton IMC")).toBeVisible();
    await page.getByPlaceholder("cm").fill("178");
    await page.getByRole("button", { name: "Valider" }).click();

    await expect(page.getByText("Renseigne ta taille pour voir ton IMC")).toHaveCount(0);
    await expect(page.getByText("IMC")).toBeVisible();
  });

  test("définir un objectif affiche la progression", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter une pesée" }).click();
    await page.getByLabel("Poids (kg)").fill("85");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await page.getByRole("button", { name: "Définir un objectif" }).click();
    await page.getByLabel("Poids cible (kg)").fill("75");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("75 kg", { exact: false })).toBeVisible();
    await expect(page.getByText(/kg à perdre/)).toBeVisible();
  });

  test("supprimer une pesée la retire de l'historique", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter une pesée" }).click();
    await page.getByLabel("Poids (kg)").fill("90");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("90 kg").first()).toBeVisible();

    await page.getByRole("button", { name: "Supprimer" }).click();
    await page.getByRole("button", { name: "Supprimer", exact: true }).last().click();

    await expect(page.getByText("Pas encore de pesée")).toBeVisible();
  });

  test("l'historique des pesées est paginé au-delà de 8 entrées", async ({ page }) => {
    // Seed via l'API plutôt que 9 allers-retours de dialog — la pagination
    // est ce qu'on teste, pas le formulaire d'ajout (déjà couvert ailleurs).
    for (let i = 0; i < 9; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const response = await page.request.post("/api/bodyweight", {
        data: { date: date.toISOString().slice(0, 10), weight: 80 + i },
      });
      expect(response.ok()).toBe(true);
    }

    await page.reload();
    await expect(page.getByText("9 pesées enregistrées.")).toBeVisible();
    await expect(page.getByText("Page 1 / 2")).toBeVisible();

    // Scoped to each row's delete button rather than the "NN kg" text, which
    // also matches the stat cards (Dernière pesée, moyennes) above the list.
    const rowsBefore = await page.getByRole("button", { name: "Supprimer" }).count();
    expect(rowsBefore).toBe(8);

    await page.getByRole("button", { name: "Page suivante" }).click();
    await expect(page.getByText("Page 2 / 2")).toBeVisible();
    const rowsAfter = await page.getByRole("button", { name: "Supprimer" }).count();
    expect(rowsAfter).toBe(1);
  });
});
