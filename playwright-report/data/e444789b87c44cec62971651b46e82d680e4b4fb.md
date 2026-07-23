# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_ui_events.spec.ts >> verify event detail view
- Location: tests/test_ui_events.spec.ts:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/auth
Call log:
  - navigating to "http://localhost:5173/auth", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('verify event detail view', async ({ page }) => {
> 4  |   await page.goto('http://localhost:5173/auth');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/auth
  5  |   await page.waitForLoadState('networkidle');
  6  |
  7  |   // Skip auth by using a fake localStorage if we can, or we can just visit the URL directly if no strict auth blocking
  8  |   await page.goto('http://localhost:5173/eventos');
  9  |   await page.waitForLoadState('networkidle');
  10 |   await page.screenshot({ path: 'playwright-report/events.png' });
  11 | });
  12 |
```