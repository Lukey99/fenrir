import { test, expect } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

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

  test("modifier un exercice personnalisé met à jour son nom", async ({ page }) => {
    await page.getByRole("button", { name: "Nouvel exercice" }).click();
    await page.getByLabel("Nom").fill("Curl banc custom");
    await page.getByLabel("Groupe musculaire").click();
    await page.getByRole("option", { name: "Biceps" }).click();
    await page.getByRole("button", { name: "Créer l'exercice" }).click();
    await expect(page.getByText("Curl banc custom").first()).toBeVisible();

    await page.getByRole("button", { name: "Modifier l'exercice" }).click();
    await page.getByLabel("Nom").fill("Curl banc incliné custom");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("Curl banc incliné custom").first()).toBeVisible();
    await expect(page.getByText("Curl banc custom", { exact: true })).toHaveCount(0);
  });

  test("supprimer un exercice personnalisé inutilisé le retire de la liste", async ({ page }) => {
    await page.getByRole("button", { name: "Nouvel exercice" }).click();
    await page.getByLabel("Nom").fill("Exercice à supprimer");
    await page.getByLabel("Groupe musculaire").click();
    await page.getByRole("option", { name: "Mollets" }).click();
    await page.getByRole("button", { name: "Créer l'exercice" }).click();
    await expect(page.getByText("Exercice à supprimer").first()).toBeVisible();

    await page.getByRole("button", { name: "Supprimer l'exercice" }).click();
    await page.getByRole("button", { name: "Supprimer", exact: true }).click();

    await expect(page.getByText("Exercice à supprimer")).toHaveCount(0);
  });

  test("supprimer un exercice personnalisé utilisé dans un programme est refusé", async ({ page }) => {
    await page.getByRole("button", { name: "Nouvel exercice" }).click();
    await page.getByLabel("Nom").fill("Exercice Programme Custom");
    await page.getByLabel("Groupe musculaire").click();
    await page.getByRole("option", { name: "Dos" }).click();
    await page.getByRole("button", { name: "Créer l'exercice" }).click();
    await expect(page.getByText("Exercice Programme Custom").first()).toBeVisible();

    await createProgramWithExercise(page, {
      programName: "Programme Exercice Utilisé",
      dayName: "Jour Test",
      exerciseName: "Exercice Programme Custom",
    });

    await page.goto("/exercises");
    await page.getByPlaceholder("Rechercher un exercice...").fill("Exercice Programme Custom");
    await page.getByRole("button", { name: "Supprimer l'exercice" }).click();
    await page.getByRole("button", { name: "Supprimer", exact: true }).click();

    // Le toast d'erreur, distinct du texte statique de la modale de confirmation
    // (qui contient un libellé similaire) — on cible le début propre au toast.
    await expect(page.getByText(/^Cet exercice est utilisé/)).toBeVisible();
    await expect(page.getByText("Exercice Programme Custom", { exact: true }).first()).toBeVisible();
  });
});
