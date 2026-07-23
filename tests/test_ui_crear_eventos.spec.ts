import { test, expect } from "@playwright/test";

test("verify create event view", async ({ page }) => {
  await page.goto("http://localhost:8080/eventos/crear");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "screenshot.png", fullPage: true });
});
