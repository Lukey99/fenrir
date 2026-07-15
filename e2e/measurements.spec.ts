import { test, expect } from "@playwright/test";
import { registerNewUser } from "./fixtures";

test.describe("Suivi des mensurations", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/bodyweight");
    await page.getByRole("tab", { name: "Mensurations" }).click();
  });

  test("ajouter des mesures les affiche dans les stats et l'historique", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter des mesures" }).click();
    await page.getByLabel("Tour de taille (cm)").fill("82");
    await page.getByLabel("Tour de poitrine (cm)").fill("98");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("82 cm").first()).toBeVisible();
    await expect(page.getByText("98 cm").first()).toBeVisible();
    await expect(page.getByText("Taille 82 cm · Poitrine 98 cm")).toBeVisible();
  });

  test("enregistrer sans aucune mesure affiche une erreur", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter des mesures" }).click();
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("Renseigne au moins une mesure.", { exact: true })).toBeVisible();
  });

  test("supprimer une entrée la retire de l'historique", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter des mesures" }).click();
    await page.getByLabel("Tour de bras (cm)").fill("38");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("Bras 38 cm")).toBeVisible();

    await page.getByRole("button", { name: "Supprimer" }).click();
    await page.getByRole("button", { name: "Supprimer", exact: true }).last().click();

    await expect(page.getByText("Pas encore de mesure")).toBeVisible();
  });

  test("l'historique des mesures est paginé au-delà de 8 entrées", async ({ page }) => {
    // Seed via l'API plutôt que 9 allers-retours de dialog — la pagination
    // est ce qu'on teste, pas le formulaire d'ajout (déjà couvert ailleurs).
    for (let i = 0; i < 9; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const response = await page.request.post("/api/bodymeasurements", {
        data: { date: date.toISOString().slice(0, 10), waistCm: 80 + i },
      });
      expect(response.ok()).toBe(true);
    }

    await page.reload();
    await page.getByRole("tab", { name: "Mensurations" }).click();
    await expect(page.getByText("9 entrées enregistrées.")).toBeVisible();
    await expect(page.getByText("Page 1 / 2")).toBeVisible();

    const rowsBefore = await page.getByRole("button", { name: "Supprimer" }).count();
    expect(rowsBefore).toBe(8);

    await page.getByRole("button", { name: "Page suivante" }).click();
    await expect(page.getByText("Page 2 / 2")).toBeVisible();
    const rowsAfter = await page.getByRole("button", { name: "Supprimer" }).count();
    expect(rowsAfter).toBe(1);
  });
});
