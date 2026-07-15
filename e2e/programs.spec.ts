import { test, expect, type Page } from "@playwright/test";
import { registerNewUser } from "./fixtures";

async function createProgram(page: Page, name: string) {
  await page.goto("/programs");
  await page.getByRole("button", { name: "Nouveau programme" }).click();
  await page.getByLabel("Nom").fill(name);
  await page.getByRole("button", { name: "Créer le programme" }).click();
  await expect(page.getByRole("link", { name })).toBeVisible();
  await page.getByRole("link", { name }).click();
  await expect(page).toHaveURL(/\/programs\/.+/);
}

async function addDay(page: Page, dayName: string) {
  await page.getByRole("button", { name: "Ajouter un jour" }).click();
  await page.getByLabel("Nom").fill(dayName);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("heading", { name: dayName, level: 2 })).toBeVisible();
}

test.describe("Constructeur de programmes", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
  });

  test("créer un programme et le voir dans la liste", async ({ page }) => {
    await createProgram(page, "Push Pull Legs");
    await expect(page.getByRole("heading", { name: "Push Pull Legs" })).toBeVisible();
    await expect(page.getByText("Ce programme n'a pas encore de jour.")).toBeVisible();
  });

  test("ajouter un jour puis un exercice au jour (bouton Ajouter)", async ({ page }) => {
    await createProgram(page, "Programme Test Exercice");
    await addDay(page, "Jour Push");

    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché barre");
    await page.getByText("Développé couché barre", { exact: true }).click();

    await page.getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();
    await expect(page.getByText("1 exercice")).toBeVisible();
  });

  test("le poids cible et le repos restent optionnels lors de l'ajout d'un exercice", async ({ page }) => {
    await createProgram(page, "Programme Champs Optionnels");
    await addDay(page, "Jour Full Body");

    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Squat barre");
    await page.getByText("Squat barre", { exact: true }).click();

    // On laisse poids cible et repos vides volontairement.
    await page.getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByText("Squat barre", { exact: true })).toBeVisible();
  });

  test("définir un poids cible à l'ajout pré-remplit la séance", async ({ page }) => {
    await createProgram(page, "Programme Poids Cible");
    await addDay(page, "Jour Poids");

    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché barre");
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids cible (kg, optionnel)").fill("100");
    await page.getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByText("100 kg", { exact: false })).toBeVisible();

    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
    await expect(page.getByPlaceholder("kg").first()).toHaveValue("100");
  });

  test("modifier un exercice qui a déjà un poids cible et un repos ne plante pas", async ({ page }) => {
    await createProgram(page, "Programme Edition Poids");
    await addDay(page, "Jour Poids Edit");

    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Développé couché barre");
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids cible (kg, optionnel)").fill("100");
    await page.getByLabel("Repos (s)").fill("90");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("100 kg", { exact: false })).toBeVisible();

    await page
      .locator("div.rounded-lg.border", { hasText: "Développé couché barre" })
      .getByRole("button", { name: "Modifier", exact: true })
      .click();

    // Le dialog doit s'ouvrir sans planter, avec les valeurs déjà pré-remplies
    // (un champ numérique optionnel déjà rempli a auparavant fait planter ce dialog).
    await expect(page.getByLabel("Poids cible (kg)")).toHaveValue("100");
    await expect(page.getByLabel("Repos (s)")).toHaveValue("90");

    await page.getByLabel("Poids cible (kg)").fill("110");
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await expect(page.getByText("110 kg", { exact: false })).toBeVisible();
  });

  test("modifier un exercice du jour", async ({ page }) => {
    await createProgram(page, "Programme Edition");
    await addDay(page, "Jour A");

    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Curl haltères");
    await page.getByText("Curl haltères", { exact: true }).click();
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText("Curl haltères", { exact: true })).toBeVisible();

    await page
      .locator("div.rounded-lg.border", { hasText: "Curl haltères" })
      .getByRole("button", { name: "Modifier", exact: true })
      .click();
    const setsInput = page.getByLabel("Séries");
    await setsInput.fill("5");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page.getByText("5 × 8-12 reps", { exact: false })).toBeVisible();
  });

  test("réordonner et supprimer un exercice du jour", async ({ page }) => {
    await createProgram(page, "Programme Reorder");
    await addDay(page, "Jour B");

    for (const name of ["Curl barre", "Curl marteau"]) {
      await page.getByRole("button", { name: "Ajouter un exercice" }).click();
      await page.getByPlaceholder("Rechercher un exercice...").fill(name);
      await page.getByText(name, { exact: true }).click();
      await page.getByRole("button", { name: "Ajouter" }).click();
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }

    await page.getByRole("button", { name: "Retirer" }).first().click();
    await expect(page.getByText("1 exercice")).toBeVisible();
  });

  test("dupliquer, archiver et supprimer un programme", async ({ page }) => {
    await page.goto("/programs");
    await page.getByRole("button", { name: "Nouveau programme" }).click();
    await page.getByLabel("Nom").fill("Programme Actions");
    await page.getByRole("button", { name: "Créer le programme" }).click();
    await expect(page.getByRole("link", { name: "Programme Actions" })).toBeVisible();

    await page
      .locator("div", { has: page.getByRole("link", { name: "Programme Actions" }) })
      .getByRole("button", { name: "Actions" })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Dupliquer" }).click();
    await expect(page.getByRole("link", { name: "Programme Actions (copie)" })).toBeVisible();

    await page
      .locator("div", { has: page.getByRole("link", { name: "Programme Actions (copie)" }) })
      .getByRole("button", { name: "Actions" })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Archiver" }).click();
    await expect(page.getByText("Archivé").first()).toBeVisible();

    await page
      .locator("div", { has: page.getByRole("link", { name: "Programme Actions (copie)" }) })
      .getByRole("button", { name: "Actions" })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Supprimer" }).click();
    await page.getByRole("button", { name: "Supprimer" }).click();
    await expect(page.getByRole("link", { name: "Programme Actions (copie)" })).toHaveCount(0);
  });
});
