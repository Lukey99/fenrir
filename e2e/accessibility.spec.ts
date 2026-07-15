import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

/** Runs axe against the current page and fails with the violations spelled
 * out (rule id, impact, affected nodes) rather than a bare array diff. */
async function expectNoViolations(page: Page) {
  // Most entrance animations here (Framer Motion fade-ups, staggered widget
  // reveals) don't check prefers-reduced-motion, so they still run even with
  // motion emulated off. Scanning mid-fade catches a transiently low
  // opacity/contrast that has nothing to do with the page's actual, at-rest
  // contrast — wait for them to settle first instead of asserting on a
  // mid-animation frame.
  await page.waitForTimeout(1000);
  const results = await new AxeBuilder({ page }).analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} élément(s)`
  );
  expect(summary, "Violations d'accessibilité (axe-core)").toEqual([]);
}

test.describe("Accessibilité", () => {
  test("page d'accueil (non connecté)", async ({ page }) => {
    await page.goto("/");
    await expectNoViolations(page);
  });

  test("page de connexion", async ({ page }) => {
    await page.goto("/login");
    await expectNoViolations(page);
  });

  test("page d'inscription", async ({ page }) => {
    await page.goto("/register");
    await expectNoViolations(page);
  });

  test("tableau de bord", async ({ page }) => {
    await registerNewUser(page);
    await expectNoViolations(page);
  });

  test("liste des programmes (vide)", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/programs");
    await expectNoViolations(page);
  });

  test("détail d'un programme, avec un jour et un exercice", async ({ page }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme A11y",
      dayName: "Jour A11y",
      exerciseName: "Développé couché barre",
    });
    await expectNoViolations(page);
  });

  test("tracker de séance en direct", async ({ page }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme A11y Séance",
      dayName: "Jour A11y Séance",
      exerciseName: "Squat barre",
    });
    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
    await expectNoViolations(page);
  });

  test("liste de progression (vide)", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/progress");
    await expectNoViolations(page);
  });

  test("liste des records (vide)", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/records");
    await expectNoViolations(page);
  });

  test("base d'exercices", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/exercises");
    await expectNoViolations(page);
  });

  test("suivi du poids de corps (vide)", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/bodyweight");
    await expectNoViolations(page);
  });

  test("paramètres", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/settings");
    await expectNoViolations(page);
  });
});
