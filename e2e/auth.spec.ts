import { test, expect } from "@playwright/test";
import { registerNewUser, uniqueEmail } from "./fixtures";

test.describe("Authentification", () => {
  test("un nouvel utilisateur peut créer un compte et arrive sur le dashboard", async ({ page }) => {
    const { name } = await registerNewUser(page);
    await expect(page.getByRole("heading", { name: new RegExp(`Bienvenue, ${name}`) })).toBeVisible();
  });

  test("un compte déjà utilisé affiche une erreur à l'inscription", async ({ page }) => {
    const { email, name } = await registerNewUser(page);

    // se déconnecte pour retenter une inscription avec le même e-mail
    await page.getByRole("button", { name: "Menu du compte" }).click();
    await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await page.goto("/register");
    await page.getByLabel("Nom").fill(name);
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Mot de passe").fill("Autrepass123!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText(/existe déjà/i)).toBeVisible();
  });

  test("logout puis login fonctionnent", async ({ page }) => {
    const { email, password } = await registerNewUser(page);

    await page.getByRole("button", { name: "Menu du compte" }).click();
    await page.getByRole("menuitem", { name: "Se déconnecter" }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("mauvais mot de passe affiche une erreur", async ({ page }) => {
    const { email } = await registerNewUser(page);

    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Mot de passe").fill("MauvaisMotDePasse!");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText(/incorrect/i)).toBeVisible();
  });

  test("un e-mail inconnu peut s'inscrire librement", async ({ page }) => {
    const email = uniqueEmail("free");
    await page.goto("/register");
    await page.getByLabel("Nom").fill("Libre");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Mot de passe").fill("Passw0rd!2345");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("l'e-mail n'est pas sensible à la casse (inscription et connexion)", async ({ page }) => {
    const email = uniqueEmail("case");
    const mixedCaseEmail = email
      .split("")
      .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c))
      .join("");

    await page.goto("/register");
    await page.getByLabel("Nom").fill("Casse Test");
    await page.getByLabel("E-mail").fill(mixedCaseEmail);
    await page.getByLabel("Mot de passe").fill("Passw0rd!2345");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.getByRole("button", { name: "Menu du compte" }).click();
    await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    // Se reconnecte avec l'e-mail tout en minuscules : doit trouver le même compte.
    await page.getByLabel("E-mail").fill(email.toLowerCase());
    await page.getByLabel("Mot de passe").fill("Passw0rd!2345");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Une réinscription avec une autre casse du même e-mail est refusée (même compte).
    await page.getByRole("button", { name: "Menu du compte" }).click();
    await page.getByRole("menuitem", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await page.goto("/register");
    await page.getByLabel("Nom").fill("Casse Test 2");
    await page.getByLabel("E-mail").fill(email.toUpperCase());
    await page.getByLabel("Mot de passe").fill("Autrepass123!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText(/existe déjà/i)).toBeVisible();
  });
});
