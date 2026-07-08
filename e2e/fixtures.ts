import { type Page, expect } from "@playwright/test";

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;
}

/** Registers a brand-new user through the real UI and lands on /dashboard. */
export async function registerNewUser(
  page: Page,
  { name = "Test User", emailPrefix = "e2e" }: { name?: string; emailPrefix?: string } = {}
) {
  const email = uniqueEmail(emailPrefix);
  const password = "Passw0rd!2345";

  await page.goto("/register");
  await page.getByLabel("Nom").fill(name);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Créer mon compte" }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  return { email, password, name };
}

/**
 * Creates a program with one day containing one exercise, through the real UI,
 * and leaves the page on that program's detail view.
 */
export async function createProgramWithExercise(
  page: Page,
  { programName, dayName, exerciseName }: { programName: string; dayName: string; exerciseName: string }
) {
  await page.goto("/programs");
  await page.getByRole("button", { name: "Nouveau programme" }).click();
  await page.getByLabel("Nom").fill(programName);
  await page.getByRole("button", { name: "Créer le programme" }).click();
  await page.getByRole("link", { name: programName }).click();
  await expect(page).toHaveURL(/\/programs\/.+/);

  await page.getByRole("button", { name: "Ajouter un jour" }).click();
  await page.getByLabel("Nom").fill(dayName);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("heading", { name: dayName, level: 3 })).toBeVisible();

  await page.getByRole("button", { name: "Ajouter un exercice" }).click();
  await page.getByPlaceholder("Rechercher un exercice...").fill(exerciseName);
  await page.getByText(exerciseName, { exact: true }).click();
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByText(exerciseName, { exact: true })).toBeVisible();
}
