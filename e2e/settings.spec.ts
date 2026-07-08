import { test, expect } from "@playwright/test";
import { registerNewUser } from "./fixtures";

test.describe("Paramètres", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/settings");
  });

  test("modifier le nom du profil", async ({ page }) => {
    await page.getByLabel("Nom").fill("Nouveau Nom");
    await page.getByRole("button", { name: "Enregistrer" }).first().click();
    await expect(page.getByText("Profil mis à jour.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Nom")).toHaveValue("Nouveau Nom");
  });

  test("changer le mot de passe puis se reconnecter avec le nouveau", async ({ page }) => {
    const newPassword = "NouveauPassw0rd!9";

    await page.getByLabel("Mot de passe actuel").fill("Passw0rd!2345");
    await page.getByLabel("Nouveau mot de passe").fill(newPassword);
    await page.getByLabel("Confirmer").fill(newPassword);
    await page.getByRole("button", { name: "Changer le mot de passe" }).click();
    await expect(page.getByText("Mot de passe mis à jour.")).toBeVisible();

    const email = await page.evaluate(async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      return data.user.email as string;
    });

    await page.getByRole("button", { name: "Menu du compte" }).click();
    await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(newPassword);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("renseigner sa taille depuis les paramètres", async ({ page }) => {
    await page.getByLabel("Taille (cm)").fill("175");
    await page.getByRole("button", { name: "Enregistrer" }).last().click();
    await expect(page.getByText("Taille enregistrée.")).toBeVisible();
  });

  test("changer l'unité de poids en lb met à jour l'affichage", async ({ page }) => {
    await page.getByRole("button", { name: "lb", exact: true }).click();
    await expect(page.getByText("Unité changée pour les livres.")).toBeVisible();

    await page.goto("/bodyweight");
    await page.getByRole("button", { name: "Ajouter une pesée" }).click();
    await expect(page.getByLabel("Poids (lb)")).toBeVisible();
  });

  test("exporter les données déclenche un téléchargement JSON", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exporter mes données" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/fenrir-export-.*\.json/);
  });

  test("importer un export valide affiche un résumé", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exporter mes données" }).click();
    const download = await downloadPromise;
    const filePath = await download.path();
    expect(filePath).toBeTruthy();

    await page.locator('input[type="file"]').setInputFiles(filePath!);
    await expect(page.getByText(/Import terminé/)).toBeVisible({ timeout: 10_000 });
  });
});
