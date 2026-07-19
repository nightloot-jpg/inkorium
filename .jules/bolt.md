## 2026-07-19 - Feed UI & Fetch Feed Fixes

**Learning:** When debugging issues where a feed fails to load, the UI may not always provide actionable errors. In this case, `fetchFeed` failed silently in the UI because the query referenced a non-existent column `event` on the `posts` table (which threw a PostgREST error), resulting in the query throwing an error and the application failing to render posts. Additionally, always refer to user-provided images as they offer exact specifications for frontend changes, such as the location input becoming an inline text field instead of triggering a prompt, and updating the status message input to have a transparent background with an italic placeholder.

**Action:** Ensure that the query arguments closely match the actual Supabase database schema, particularly when dealing with auto-generated schema types (`types.ts`). For frontend tweaks, pay strict attention to exact user references and CSS classes in visual examples.

## 2026-07-19 - Calendar Card Update

**Learning:** When users provide visual designs for a specific component (like replacing manual date inputs with a date picker calendar), we need to check if the UI library already has a corresponding component (e.g. `Calendar` from `react-day-picker` / Radix). When integrating `react-day-picker` version 9+ with `lucide-react` icons, note that the way to override chevron icons has changed from `IconLeft` / `IconRight` to a `Chevron` component that takes an `orientation` prop.

**Action:** Ensure third-party component props (like `react-day-picker`) match their installed version. Read the package.json to verify the version before making assumptions about its API.
