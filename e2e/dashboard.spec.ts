import { test, expect } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

test.describe("Tableau de bord", () => {
  test("une séance en cours s'affiche à la place de la séance du jour, et se reprend", async ({
    page,
  }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme Dashboard",
      dayName: "Jour Dashboard",
      exerciseName: "Développé couché barre",
    });
    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
    const sessionId = new URL(page.url()).pathname.split("/workout/")[1];

    await page.goto("/dashboard");
    // .first(): a reload can transiently leave a second, hidden copy of this
    // text in the accessibility tree (Next dev/Fast Refresh artifact) — see
    // the same fix in records.spec.ts.
    await expect(page.getByText("Séance en cours").first()).toBeVisible();
    await expect(page.getByText("Jour Dashboard").first()).toBeVisible();
    // The "Séance du jour" widget is replaced, not just supplemented — the
    // dashboard shouldn't offer to start a new session on top of the one
    // already running.
    await expect(page.getByText("Séance du jour")).toHaveCount(0);

    await page.getByRole("button", { name: "Reprendre" }).click();
    await expect(page).toHaveURL(new RegExp(`/workout/${sessionId}`));
  });
});
