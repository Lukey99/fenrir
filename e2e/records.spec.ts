import { test, expect } from "@playwright/test";
import { registerNewUser } from "./fixtures";

test.describe("Records", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/records");
  });

  test("ajouter un record l'affiche dans l'aperçu par catégorie", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter un record" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché barre");
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids (kg)").fill("100");
    await page.getByLabel("Reps").fill("3");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();
    await expect(page.getByText("100 kg × 3")).toBeVisible();
  });

  test("l'historique des records d'un exercice est paginé au-delà de 10 entrées", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter un record" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Squat barre");
    await page.getByText("Squat barre", { exact: true }).click();
    await page.getByLabel("Poids (kg)").fill("100");
    await page.getByLabel("Reps").fill("5");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    // The dialog keeps its last content (including this same exercise name,
    // as its description) mounted during its closing transition — clicking
    // "Squat barre" before it's actually gone can hit that stale text instead
    // of the real list link below, which does nothing and never navigates.
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByText("Squat barre", { exact: true }).click();
    await expect(page).toHaveURL(/\/records\/.+/);
    const exerciseId = new URL(page.url()).pathname.split("/records/")[1];

    // Seed via l'API plutôt que 10 allers-retours de dialog — la pagination
    // est ce qu'on teste, pas le formulaire d'ajout (déjà couvert ci-dessus).
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i + 1));
      const response = await page.request.post("/api/records", {
        data: {
          exerciseId,
          weight: 100 + i,
          reps: 5,
          achievedAt: date.toISOString().slice(0, 10),
        },
      });
      expect(response.ok()).toBe(true);
    }

    await page.reload();
    // .first(): a reload can transiently leave a second, hidden copy of this
    // text in the accessibility tree (Next dev/Fast Refresh artifact) — a
    // bare getByText would then throw a strict-mode violation instead of just
    // waiting for the one real, visible instance.
    await expect(page.getByText("Page 1 / 2").first()).toBeVisible();

    const rowsBefore = await page.getByRole("button", { name: "Supprimer ce record" }).count();
    expect(rowsBefore).toBe(10);

    await page.getByRole("button", { name: "Page suivante" }).click();
    await expect(page.getByText("Page 2 / 2")).toBeVisible();
    const rowsAfter = await page.getByRole("button", { name: "Supprimer ce record" }).count();
    expect(rowsAfter).toBe(1);
  });
});
