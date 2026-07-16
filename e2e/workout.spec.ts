import { test, expect, type Page } from "@playwright/test";
import { registerNewUser, createProgramWithExercise } from "./fixtures";

/** Validates the currently-shown set (weight/reps), confirms the rest-config
 * sheet, and lands on the resting countdown. */
async function validateSetAndConfirmRest(page: Page, weight: string, reps: string) {
  await page.getByLabel("Poids (kg)").fill(weight);
  await page.getByLabel("Reps").fill(reps);
  await page.getByRole("button", { name: "Valider la série" }).click();
  await expect(page.getByRole("heading", { name: "Temps de repos" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmer" }).click();
  await expect(page.getByRole("button", { name: "Passer le temps de repos" })).toBeVisible();
}

/**
 * Creates a program day with two exercises grouped into a superset, then
 * starts a session from it. Mirrors the grouping UI flow exercised in
 * programs.spec.ts, but here as setup for the guided session's behavior.
 */
async function createProgramWithSupersetAndStartSession(page: Page) {
  await registerNewUser(page);
  await page.goto("/programs");
  await page.getByRole("button", { name: "Nouveau programme" }).click();
  await page.getByLabel("Nom").fill("Programme Superset Tracker");
  await page.getByRole("button", { name: "Créer le programme" }).click();
  await page.getByRole("link", { name: "Programme Superset Tracker" }).click();
  await expect(page).toHaveURL(/\/programs\/.+/);

  await page.getByRole("button", { name: "Ajouter un jour" }).click();
  await page.getByLabel("Nom").fill("Jour Superset");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("heading", { name: "Jour Superset", level: 2 })).toBeVisible();

  for (const name of ["Développé couché barre", "Curl haltères"]) {
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill(name);
    await page.getByText(name, { exact: true }).click();
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }

  await page.getByRole("button", { name: "Grouper en superset" }).click();
  await page
    .getByRole("checkbox", { name: "Sélectionner Développé couché barre pour le superset" })
    .check();
  await page.getByRole("checkbox", { name: "Sélectionner Curl haltères pour le superset" }).check();
  await page.getByRole("button", { name: "Créer le superset" }).click();
  await expect(page.getByText("Superset — 2 exercices enchaînés")).toBeVisible();

  await page.getByRole("button", { name: "Démarrer" }).click();
  await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
}

test.describe("Séance guidée", () => {
  test.beforeEach(async ({ page }) => {
    await registerNewUser(page);
    await createProgramWithExercise(page, {
      programName: "Programme Workout",
      dayName: "Jour Full Body",
      exerciseName: "Développé couché barre",
    });
    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
  });

  test("démarrer une séance arrive sur l'écran de sélection d'exercice, sans navigation possible", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: "Jour Full Body" })).toBeVisible();
    await expect(page.getByText("Choisis l'exercice à faire.")).toBeVisible();
    await expect(page.getByText("Développé couché barre", { exact: true })).toBeVisible();
    await expect(page.getByText("Pectoraux · 0/3 séries")).toBeVisible();

    // Le verrouillage de navigation est structurel : aucun lien de menu n'existe sur cette route.
    await expect(page.getByRole("link", { name: "Tableau de bord" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Programmes" })).toHaveCount(0);
  });

  test("sélectionner un exercice arrive sur l'écran de validation de série", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();

    await expect(page.getByRole("heading", { name: "Développé couché barre" })).toBeVisible();
    await expect(page.getByText("Série 1 / 3")).toBeVisible();
    await expect(page.getByText("Cible : 8-12 reps")).toBeVisible();
  });

  test("valider une série demande le temps de repos puis affiche le compte à rebours", async ({
    page,
  }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids (kg)").fill("80");
    await page.getByLabel("Reps").fill("10");
    await page.getByRole("button", { name: "Valider la série" }).click();

    await expect(page.getByRole("heading", { name: "Temps de repos" })).toBeVisible();
    await expect(page.getByLabel("Durée (secondes)")).toHaveValue("90");
    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(page.getByText("Repos — Développé couché barre")).toBeVisible();
    await expect(page.getByRole("button", { name: "Arrêter la séance" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Passer le temps de repos" })).toBeVisible();
  });

  test("passer le repos enchaîne automatiquement sur la série suivante du même exercice", async ({
    page,
  }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await validateSetAndConfirmRest(page, "80", "10");
    await page.getByRole("button", { name: "Passer le temps de repos" }).click();

    await expect(page.getByText("Série 2 / 3")).toBeVisible();
  });

  test("compléter toutes les séries d'un exercice revient à la sélection avec le badge Terminé", async ({
    page,
  }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    for (let i = 0; i < 3; i++) {
      await validateSetAndConfirmRest(page, "80", "10");
      await page.getByRole("button", { name: "Passer le temps de repos" }).click();
    }

    await expect(page.getByText("Choisis l'exercice à faire.")).toBeVisible();
    await expect(page.getByText("Terminé", { exact: true })).toBeVisible();
    await expect(page.getByText("Bravo, tout est terminé")).toBeVisible();
  });

  test("retour à la liste depuis la validation n'interrompt pas la séance", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByRole("button", { name: "Retour à la liste" }).click();

    await expect(page.getByText("Choisis l'exercice à faire.")).toBeVisible();
    await expect(page.getByText("Pectoraux · 0/3 séries")).toBeVisible();
  });

  test("compléter une série qui bat le record existant l'enregistre et l'annonce", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids (kg)").fill("100");
    await page.getByLabel("Reps").fill("5");
    await page.getByRole("button", { name: "Valider la série" }).click();

    await expect(page.getByText(/Nouveau record.*Développé couché barre/)).toBeVisible();

    await page.goto("/records");
    await expect(page.getByText("100 kg × 5")).toBeVisible();
  });

  test("compléter une série qui ne bat pas le record existant ne crée rien", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await validateSetAndConfirmRest(page, "100", "5");
    await expect(page.getByText(/Nouveau record/)).toHaveCount(0, { timeout: 8000 });
    await page.getByRole("button", { name: "Passer le temps de repos" }).click();

    // Deuxième série, plus faible — ne doit pas déclencher de nouveau record.
    await expect(page.getByText("Série 2 / 3")).toBeVisible();
    await page.getByLabel("Poids (kg)").fill("60");
    await page.getByLabel("Reps").fill("5");
    await page.getByRole("button", { name: "Valider la série" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Nouveau record/)).toHaveCount(0);

    await page.goto("/records");
    await expect(page.getByText("60 kg × 5")).toHaveCount(0);
  });

  test("ajouter une série supplémentaire une fois les séries prévues terminées", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    for (let i = 0; i < 3; i++) {
      await validateSetAndConfirmRest(page, "80", "10");
      await page.getByRole("button", { name: "Passer le temps de repos" }).click();
    }
    await expect(page.getByText("Terminé", { exact: true })).toBeVisible();

    await page.getByText("Développé couché barre", { exact: true }).click();
    await expect(page.getByText("Toutes les séries prévues sont terminées.")).toBeVisible();
    await page.getByRole("button", { name: "Ajouter une série supplémentaire" }).click();
    await expect(page.getByText("Série 4 / 4")).toBeVisible();
  });

  test("remplacer un exercice", async ({ page }) => {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Remplacer" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Squat barre");
    await page.getByText("Squat barre", { exact: true }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(page.getByText("Squat barre", { exact: true })).toBeVisible();
    await expect(page.getByText("Remplacé", { exact: true })).toBeVisible();
  });

  test("ignorer puis restaurer un exercice", async ({ page }) => {
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Ignorer" }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();

    await expect(page.getByText("Ignoré", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Restaurer" }).click();
    await expect(page.getByText("Ignoré", { exact: true })).toHaveCount(0);
  });

  test("ajouter un exercice libre à la séance (bouton Ajouter)", async ({ page }) => {
    await page.getByRole("button", { name: "Ajouter un exercice" }).click();
    await page.getByPlaceholder("Rechercher un exercice...").fill("Curl haltères");
    await page.getByText("Curl haltères", { exact: true }).click();
    await page.getByRole("button", { name: "Ajouter" }).click();

    await expect(page.getByText("Curl haltères", { exact: true })).toBeVisible();
    await expect(page.getByText("Ajouté", { exact: true })).toBeVisible();
  });

  test("terminer la séance affiche un récapitulatif puis ferme la modale", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids (kg)").fill("80");
    await page.getByLabel("Reps").fill("10");
    await page.getByRole("button", { name: "Valider la série" }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();
    await page.getByRole("button", { name: "Retour à la liste" }).click();

    await page.getByRole("button", { name: "Terminer la séance" }).click();
    await page.getByRole("button", { name: "Terminer", exact: true }).click();

    await expect(page.getByText("Séance terminée !")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("800 kg", { exact: false })).toBeVisible();

    await page.getByRole("button", { name: "Fermer" }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });
  });

  test("arrêter la séance depuis l'écran de repos affiche aussi le récapitulatif", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await validateSetAndConfirmRest(page, "80", "10");
    await page.getByRole("button", { name: "Arrêter la séance" }).click();
    await page.getByRole("button", { name: "Terminer", exact: true }).click();

    await expect(page.getByText("Séance terminée !")).toBeVisible({ timeout: 10_000 });
  });

  test("supprimer une séance (démarrée par accident) redirige et la retire de l'historique", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Supprimer la séance" }).click();
    await page.getByRole("button", { name: "Supprimer", exact: true }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });

    await page.goto("/dashboard");
    await expect(page.getByText("Jour Full Body")).toHaveCount(0);
  });

  test("le poids se pré-remplit automatiquement d'une séance à l'autre", async ({ page }) => {
    await page.getByText("Développé couché barre", { exact: true }).click();
    await page.getByLabel("Poids (kg)").fill("80");
    await page.getByLabel("Reps").fill("10");
    await page.getByRole("button", { name: "Valider la série" }).click();
    await page.getByRole("button", { name: "Confirmer" }).click();
    await page.getByRole("button", { name: "Arrêter la séance" }).click();
    await page.getByRole("button", { name: "Terminer", exact: true }).click();
    await expect(page.getByText("Séance terminée !")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Fermer" }).click();
    await expect(page).toHaveURL(/\/programs\/.+|\/dashboard/, { timeout: 15_000 });

    // Une toute nouvelle séance sur le même exercice reprend le dernier poids loggé.
    await page.getByRole("button", { name: "Démarrer" }).click();
    await expect(page).toHaveURL(/\/workout\/.+/, { timeout: 15_000 });
    await page.getByText("Développé couché barre", { exact: true }).click();
    await expect(page.getByLabel("Poids (kg)")).toHaveValue("80");
  });
});

test.describe("Superset dans la séance guidée", () => {
  test.beforeEach(async ({ page }) => {
    await createProgramWithSupersetAndStartSession(page);
  });

  test("le superset est signalé dans la sélection, et 'Retour à la liste' permet d'alterner", async ({
    page,
  }) => {
    await expect(page.getByText("Superset", { exact: true }).first()).toBeVisible();

    // Une série sur le premier exercice, puis retour manuel à la liste (au lieu
    // d'enchaîner automatiquement) pour aller faire le partenaire du superset.
    await page.getByText("Développé couché barre", { exact: true }).click();
    await validateSetAndConfirmRest(page, "80", "10");
    await page.getByRole("button", { name: "Retour à la liste" }).click();

    await expect(page.getByText("Choisis l'exercice à faire.")).toBeVisible();
    await page.getByText("Curl haltères", { exact: true }).click();
    await expect(page.getByText("Série 1 / 3")).toBeVisible();
  });
});
