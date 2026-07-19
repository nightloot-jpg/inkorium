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

## 2026-07-19 - Calendar Customization & Localization

**Learning:** When customizing `react-day-picker` components to match detailed visual specs with specific localization requirements (like Spanish month names and abbreviated day headers), utilizing `date-fns` formatters is highly effective. Combining these formatters with targeted CSS variables (`--rdp-*`) allows for precise replication of custom designs like dark mode accents, circular day selections, and dot indicators for events, all without breaking the component's underlying accessibility.

**Action:** Whenever tasked with aligning a third-party UI component exactly with a provided screenshot, inspect both the layout (CSS structure) and the text formatting (locale/date manipulation). Use `date-fns` alongside custom CSS to achieve a perfect visual match while maintaining structural integrity.

## 2024-05-18 - Calendar Redesign

**Learning:** When applying massive CSS modifications to a generic component like `react-day-picker`, it's easier to use native CSS variables exposed by the library while overriding class styles directly rather than relying solely on Tailwind utility classes if the library has a specific nested structure.

**Action:** Before redesigning component libraries, examine their CSS variable API (`.rdp-root { --rdp-accent-color: ... }`) to reduce the amount of `!important` overriding required.

## 2024-07-19 - [Implement inline event creation form in calendar]

**Learning:** Translating mobile-first UI mockups directly to an existing codebase requires understanding the context boundary (in this case, dropping the floating absolute UI for an inline layout within the calendar boundaries, and using appropriate standard icons).
**Action:** Always test layout positioning closely when transitioning absolute layered components into relative flex flow to prevent UI jumps or z-index overflow.

## 2024-07-19 - [Fix calendar arrow interaction]

**Learning:** Re-styling nested 3rd party components (like react-day-picker `rdp-nav`) requires understanding their internal DOM structure. By applying `pointer-events: none` to the parent to allow clicks to pass through to the caption, you must also explicitly set `pointer-events: auto` and a higher `z-index` on the buttons themselves so they remain interactive.
**Action:** Whenever applying `pointer-events: none` to wrapper components for visual overlay hacking, ensure all interactive children explicitly restore `pointer-events: auto`.

## 2024-05-18 - Full Profile Layout Redesign

**Learning:** Rebuilding a full responsive layout that mimics a complex 3-column legacy UI involves integrating real data queries into heavily structured flex/grid containers. Ensure database queries map accurately to types and we avoid querying non-existent columns unless type-checked.
**Action:** When performing full-page overhauls, structure the component hierarchically and modularly. Use `lg:grid` for complex structural boundaries.

## 2024-05-18 - Supabase Schema Mapping
**Learning:** Hard-coded select statements in `.select("foo, bar")` are strictly evaluated by PostgREST at runtime, not just at compile-time. If you add columns in a mockup UI, you *must not* fetch them from the database API unless a corresponding SQL migration has run, otherwise it returns 400 Bad Request and breaks the route.
**Action:** Always check `types.ts` as the absolute source of truth for safe columns, and avoid querying placeholder/mocked fields against the database API.
