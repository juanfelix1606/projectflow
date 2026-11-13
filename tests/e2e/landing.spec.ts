import { expect, test } from "@playwright/test";

test("marketing page presents the product and working calls to action", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/ProjectFlow/);
  await expect(page.getByRole("heading", { name: /bring your team's best work together/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /get started/i }).first()).toHaveAttribute("href", "/register");
  await expect(page.getByRole("link", { name: /sign in/i }).first()).toHaveAttribute("href", "/login");
  await expect(page.getByText(/all displayed sample data is fictional/i)).toBeVisible();
});

test("authentication routes explain the external Supabase setup", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: /connect your supabase project/i })).toBeVisible();
  await expect(page.getByText(/NEXT_PUBLIC_SUPABASE_URL/)).toBeVisible();
});

test("protected routes show setup instructions instead of demo data when Supabase is absent", async ({ page }) => {
  await page.goto("/app");

  await expect(page.getByRole("heading", { name: /connect your supabase project/i })).toBeVisible();
  await expect(page.getByText(/never put a supabase service-role key/i)).toBeVisible();
});

test("landing page stays usable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /bring your team's best work together/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /get started for free/i })).toBeVisible();
});
