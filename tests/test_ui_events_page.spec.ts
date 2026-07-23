import { test, expect } from "@playwright/test";

test("load eventos page", async ({ page }) => {
  const res = await page.goto("http://localhost:8080/eventos");

  if (res && res.status() >= 400) {
    console.error("Error status:", res.status());
  }

  // Check if error message is on page
  const content = await page.content();
  if (content.includes("This page didn't load")) {
    console.error("PAGE FAILED TO LOAD");
  }
});
