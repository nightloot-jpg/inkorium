import { test, expect } from "@playwright/test";

test("load evento detail page", async ({ page }) => {
  // Navigate to events list to maybe grab an event or just to /eventos and wait
  const res = await page.goto("http://localhost:8080/eventos");
  await page.waitForLoadState("networkidle");

  // Attempt to take a screenshot to inspect
  await page.screenshot({ path: "eventos_index.png", fullPage: true });
});
