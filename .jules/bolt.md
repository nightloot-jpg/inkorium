## 2026-07-19 - Feed UI & Fetch Feed Fixes

**Learning:** When debugging issues where a feed fails to load, the UI may not always provide actionable errors. In this case, `fetchFeed` failed silently in the UI because the query referenced a non-existent column `event` on the `posts` table (which threw a PostgREST error), resulting in the query throwing an error and the application failing to render posts. Additionally, always refer to user-provided images as they offer exact specifications for frontend changes, such as the location input becoming an inline text field instead of triggering a prompt, and updating the status message input to have a transparent background with an italic placeholder.

**Action:** Ensure that the query arguments closely match the actual Supabase database schema, particularly when dealing with auto-generated schema types (`types.ts`). For frontend tweaks, pay strict attention to exact user references and CSS classes in visual examples.

## 2026-07-19 - Calendar Card Update

**Learning:** When users provide visual designs for a specific component (like replacing manual date inputs with a date picker calendar), we need to check if the UI library already has a corresponding component (e.g. `Calendar` from `react-day-picker` / Radix). When integrating `react-day-picker` version 9+ with `lucide-react` icons, note that the way to override chevron icons has changed from `IconLeft` / `IconRight` to a `Chevron` component that takes an `orientation` prop.

**Action:** Ensure third-party component props (like `react-day-picker`) match their installed version. Read the package.json to verify the version before making assumptions about its API.

## 2026-07-19 - Calendar UI Adjustments

**Learning:** When users provide exact visual specs, such as a grid calendar layout with specific border styles and dot headers, we can leverage standard CSS inside `<style>` blocks alongside Tailwind utilities in the class map. Avoid trying to use inline JS logic if a pure CSS approach (like `::before` pseudo elements) resolves the styling cleanly.

**Action:** Be meticulous about mapping visual structures in Tailwind. Ensure you use standard CSS when Tailwind limits complex logic like `nth-child` dynamic styling on internal library structures.

## 2026-07-19 - Interactive Calendar UI Adjustments

**Learning:** It is crucial to read the specific visual reference provided for each step of a multi-stage request. In this stage, the user provided a different layout reference which required restoring the calendar navigation and standard text headers instead of dots. Combining visual structural changes (CSS) with functional changes (conditional rendering of inputs only when a date is selected) ensures the component aligns precisely with user intent.

**Action:** Re-evaluate visual references with every new request rather than carrying forward assumptions from previous iterations. Use conditional rendering in React to naturally hide/show form fields based on state changes (e.g., date selection).
