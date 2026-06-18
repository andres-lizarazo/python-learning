import { expect, test } from "@playwright/test";

test("home renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Learn Python/i })).toBeVisible();
  await expect(page.getByText(/Learning path/i)).toBeVisible();
});

test("runs Python in a lesson (boots Pyodide end-to-end)", async ({ page }) => {
  await page.goto("/learn/basics/variables-and-types");

  // The first runnable block's Run button is disabled until Pyodide finishes booting.
  const runBtn = page.getByRole("button", { name: /^Run$/ }).first();
  await expect(runBtn).toBeEnabled({ timeout: 90_000 });
  await runBtn.click();

  // The snippet prints "Ada is 30 years old".
  await expect(page.getByText(/Ada is 30 years old/)).toBeVisible({ timeout: 60_000 });
});

test("challenge runner executes tests in the browser", async ({ page }) => {
  await page.goto("/learn/basics/variables-and-types");

  // The challenge's Submit button is disabled until Pyodide boots.
  const submit = page.getByRole("button", { name: /^Submit$/ });
  await expect(submit).toBeEnabled({ timeout: 90_000 });

  // Submitting the starter code (which returns None) runs the harness in Pyodide and
  // reports results — verifying buildHarness + execution + the results UI end-to-end.
  // (We avoid driving Monaco's editor here, which is flaky to type into in headless.)
  await submit.click();
  await expect(page.getByText(/\d \/ 3 tests passed/)).toBeVisible({ timeout: 60_000 });
});

test("user-driven visualizer records & animates frames", async ({ page }) => {
  await page.goto("/learn/dsa/sorting");

  // Scope to the user-viz card (the page also has several canned sorting widgets).
  const card = page.locator(".glass").filter({ hasText: "Animate your own sort" });
  const runBtn = card.getByRole("button", { name: /Run & animate/ });
  await expect(runBtn).toBeEnabled({ timeout: 90_000 });
  await runBtn.click();

  // After running, the recorded frames drive the bar animation + step controls.
  await expect(card.getByText(/Frame 1\//)).toBeVisible({ timeout: 60_000 });
});
