import { test, expect } from "@playwright/test";

test("verify profile layout", async ({ page }) => {
  await page.goto("http://localhost:8080");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshot.png", fullPage: true });
});
