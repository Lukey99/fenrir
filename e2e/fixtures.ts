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
  await expect(page.getByRole("heading", { name: dayName, level: 2 })).toBeVisible();

  await page.getByRole("button", { name: "Ajouter un exercice" }).click();
  await page.getByPlaceholder("Rechercher un exercice...").fill(exerciseName);
  await page.getByText(exerciseName, { exact: true }).click();

  // Wait for the actual POST round-trip, not just the click — the exercise
  // picker keeps its filtered results (including this exact name) rendered
  // in the still-open dialog while the request is in flight, so asserting
  // visibility without pinning to the response is a false positive: it can
  // pass before the row is ever persisted, and a subsequent page.goto can
  // then abort the still-pending request outright (net::ERR_ABORTED),
  // silently losing the "add exercise to program" write.
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => /\/api\/programs\/[^/]+\/days\/[^/]+\/exercises$/.test(res.url()) && res.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Ajouter" }).click(),
  ]);
  if (!response.ok()) {
    throw new Error(`Échec de l'ajout de l'exercice "${exerciseName}" au programme : ${response.status()}`);
  }

  await expect(page.getByText(exerciseName, { exact: true })).toBeVisible();
}
