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

**Learning:** Hard-coded select statements in `.select("foo, bar")` are strictly evaluated by PostgREST at runtime, not just at compile-time. If you add columns in a mockup UI, you _must not_ fetch them from the database API unless a corresponding SQL migration has run, otherwise it returns 400 Bad Request and breaks the route.
**Action:** Always check `types.ts` as the absolute source of truth for safe columns, and avoid querying placeholder/mocked fields against the database API.

## 2026-07-19 - Added cover_url to Supabase Profiles\n\n**Learning:** The frontend code (`perfil.$username.tsx`) and TypeScript definitions (`types.ts`) expected a `cover_url` field in the `profiles` table, but it was missing from the Supabase database schema. This mismatch caused a 400 Bad Request error when fetching the profile, preventing the profile page from loading entirely.\n\n**Action:** Applied a database migration to add the missing `cover_url` column (`text`) to the `profiles` table. When encountering 400 Bad Request errors on data fetching from Supabase, immediately verify that the requested columns actually exist in the database schema.

## 2024-03-22 - [Profile Status Implementation]

**Learning:** Added dynamic state fields directly within existing Supabase mappings requiring precise type matching to pass `tsc`. Popovers handle their own internal state to prevent messy parent component states.
**Action:** Always verify `profiles` type compatibility before writing the query to ensure `tsc` doesn’t bark about `unknown` conversions.

## 2026-07-19 - Profile Age/Location Editor and Visit Analytics

**Learning:** When adding editable properties to a user profile, like age and location, combined with complex relational analytics (tracking specific profile visitors using a join table), the types generated by Supabase need to be carefully patched if a direct regeneration isn't possible in the sandbox. A common pitfall when querying joined tables (like \`profile_visits\` joined with \`profiles\`) is ensuring the frontend types match the expected relational shape, or casting safely to avoid \`@typescript-eslint/no-explicit-any\` errors while not breaking strict TS rules on excess properties. Additionally, replacing an inline UI element with a Radix Popover and HoverCard requires careful handling of accessibility triggers and layout changes.

**Action:** When adding new database capabilities (tables, RPC functions) manually via migrations, always meticulously update the corresponding TypeScript definitions in \`types.ts\`. For complex nested updates, if strict typing fails, use safer type assertions like \`as unknown as { [key: string]: never }\` instead of \`any\` to appease the linter, or precisely define the minimal required shape for the UI component.

## 2026-07-19 - [Classic Tuenti Redesign]

**Learning:** Reverting a modern UI (large rounded corners, drop shadows, custom fonts) to a classic flat design involves systematic replacements of Tailwind classes (`rounded-2xl` -> `rounded-sm`, `shadow-card` -> `shadow-none` or subtle border). It is more effective to trace the CSS variables first (`--radius`, `--shadow-card`) to make global changes, and then do specific component class updates.
**Action:** When asked to clone an old or classic design blueprint, always check `styles.css` root variables first. Many "modern" aesthetics can be disabled globally (e.g., setting `--radius` to a small value and disabling heavy shadows) before touching individual components.

## 2026-07-20 - Responsive Grid Layout for Desktop vs Mobile

**Learning:** Hardcoding grid columns without proper mobile fallbacks (like flex-col) forces sidebars to appear on top of or alongside the main feed on small screens, breaking usability.
**Action:** Always use a flex-col layout for mobile by default and apply grid column classes using lg: modifiers for desktop.

## 2026-07-20 - Extracting layout logic to Sidebar layouts

**Learning:** When moving a sidebar from a specific view (`feed.tsx`) to a global layout (`_sidebar.tsx`), the router hierarchy must be correctly configured in TanStack router by renaming the file structure. For file-based routing, moving `feed.tsx` to `_sidebar/feed.tsx` and creating `_sidebar.tsx` wraps the child view correctly.
**Action:** When performing layout extractions, verify the generated routing tree (`src/routeTree.gen.ts`) to ensure path assignments correctly reflect the new parent-child hierarchy before assuming the refactor is complete.

## 2026-07-20 - Removing duplicate sidebars when extracting Layouts

**Learning:** When moving a layout element (like a Sidebar) from an individual view into a global parent Layout view, the original markup MUST be removed from the child view. Failing to do so (or failing to confirm the patch was fully applied) results in visually duplicated elements across columns.
**Action:** Always verify with `grep` that the class names or elements targeted for removal from a file no longer exist in that file after executing a script or patch.

## 2026-07-20 - Global Navigation and Sidebar Widgets

**Learning:** When expanding a global layout to match a screenshot, verify all required widgets (e.g., Profile cards, 'Escuchando ahora' music widgets) are appended correctly inside the `<aside>` element and that no HTML nesting rules are broken (like improperly closing generic structural tags).
**Action:** Cross-reference final component code with the user's uploaded images to ensure all visual sub-components within a layout area are accounted for.

## 2026-07-20 - UI Composer Compact Layout

**Learning:** When dealing with horizontally scrolling element containers like a composer tab list, using flex-wrap rather than overflow-x-auto combined with whitespace-nowrap can solve horizontal scrolling issues and keep layout constrained to the parent's width, particularly important for complex UI sections like a social network's feed composer. Adding a dropdown for secondary less-used items provides a much cleaner, compact visual.

**Action:** Whenever I encounter an issue with overflowing toolbars or tabs in responsive interfaces, I should consider using flex-wrap and dropdowns to group less-frequent actions, making sure not to use fixed horizontal scrolling (`overflow-x-auto`) unless specifically required by the design context.

## 2026-07-20 - UI Composer Compact Layout (Update)

**Learning:** When trying to eliminate horizontal scrolling from a dense row of buttons (like a composer toolbar), using `overflow-hidden` along with `whitespace-nowrap` on a flex container, combined with appropriate flexible padding, ensures that the layout will remain constrained to a single line even if content is squeezed, effectively solving scrollbar issues in responsive designs.

**Action:** Whenever I encounter an issue with overflowing toolbars or tabs in responsive interfaces and the prompt specifies exact order without a scrollbar, I should apply properties like `flex-shrink`, `white-space: nowrap`, and `overflow: hidden` strictly without resorting to wrapping.

## 2024-05-18 - Full Width CSS Grid Layout

**Learning:** When dealing with nested CSS grids (e.g. `Layout -> Outlet -> Feed`), achieving an outer `25% 1fr 25%` structure requires mathematical adjustment. If the outer grid is `25% 1fr`, the remaining space is 75%. To make the right column inside the `1fr` space take up 25% of the total screen, it must be set to `33.333%` (because 33.333% of 75% = 25%).

**Action:** Before changing grid templates spanning multiple nested components, trace the layout tree and apply percentage-based math to nested elements to correctly achieve absolute visual proportions.

## 2024-05-18 - Nested CSS Grid Layouts

**Learning:** When requested to balance columns using percentages (e.g. 55% for feed, 25% for sidebar) within nested grid definitions, using `minmax(minPx, 1fr)` for the main content area correctly delegates the job of absorbing remaining layout space to CSS Grid without having to perform manual fraction math against the parent container's width.

**Action:** Use `1fr` instead of max-width bounds when the goal is to make a central column absorb the remaining layout space perfectly.

## 2024-05-18 - Nested Grid Queries and Imports

**Learning:** When moving or creating a new section (like the friends list) in a layout component that originally didn't have data fetching, it is critical to ensure that all dependencies, components, and variables (e.g., `supabase`, `Avatar`, `Link`) are correctly imported. Omitting these causes fatal runtime crashes in React (ReferenceError).

**Action:** Always cross-reference the required dependencies when copying JSX code or custom logic to a different file, ensuring all necessary imports exist.

## 2023-10-26 - Responsive Grid Expansion

**Learning:** When expanding a fixed maximum width layout to be more fluid (edge-to-edge), nested grid columns (`grid-cols-[...]`) must be adjusted to allow intermediate columns (`1fr`) to scale without overflowing out of bounds, especially when side columns use minimum pixel requirements. Combining `minmax(px, %)` provides strong baseline scaling across both ultrawide monitors and smaller desktop screens.
**Action:** When updating a restricted grid layout (`max-w`) to `w-full`, aggressively check the layout rules inside the `route.tsx` and all subsequent children components (`feed.tsx`, `_sidebar.tsx`) rather than only modifying the outermost element.

## 2023-10-26 - Hybrid Grid Layout

**Learning:** When building responsive edge-to-edge layouts that have distinct sidebars, using purely proportional columns (e.g. `25% 1fr 25%`) can result in sidebars becoming awkwardly wide on large monitors. A hybrid grid approach with fixed outer constraints and a fluid center (e.g. `grid-cols-[240px_minmax(500px,1fr)_320px]`) ensures side content remains compact and usable while the main content area gracefully absorbs all remaining viewport space.
**Action:** Default to hybrid grid definitions (`fixed-px fluid-fr fixed-px`) over percentage-based columns for sidebar layouts on full-width applications, unless specifically required to stretch sidebar elements.

## 2023-10-26 - Symmetrical Hybrid Grid & Text Wrapping

**Learning:** When using fixed widths on sidebars, you might inadvertently compress textual content inside if it exceeds the fixed bounds. Specifically, text-overflow classes like `truncate` can prematurely hide content in narrow, fixed-width sidebars. Replacing `truncate` with `break-words` on important identifying elements (like display names) inside narrow fixed containers ensures legibility without breaking layout bounds.
**Action:** Always check text-wrapping properties (`truncate` vs `break-words`) when narrowing or fixing column widths in grid layouts.

## 2023-10-26 - Visual Polishing and Consistency

**Learning:** Subtle CSS modifications like border-radius consistency (e.g., matching outer cards with `10px` and inner images with `12px` or similar proportions), consistent soft shadows, and light backgrounds (e.g. `#f3f5f8`) create a highly modern, breathable layout without redesigning any functional components.
**Action:** When performing visual "polish" tasks, prioritize standardizing paddings, gaps, and corner radiuses across the entire layout before attempting complex structural overhauls.

## 2024-07-21 - Complete Post Composer Modularity

**Learning:** Organizing forms modularly through individual components controlled by a master composer component scales far better than inline states, especially when dealing with over 10 distinct types of posts with varying payloads. Utilizing Supabase's JSONB for the metadata ensures flexibility without schema bloat for sparse attributes.
**Action:** When implementing complex multi-type forms, immediately reach for a strategy pattern or modular layout orchestrator and rely on JSONB columns to prevent an explosion of sparse relational columns.

## 2024-05-18 - Redesign Music Composer with complex UI

**Learning:** Replaced a simple input with a much more complex UI inside an existing `feed.tsx` component while keeping the global form state working. Handled a tricky edge case with inline regex replacements in React components where curly braces and escape characters conflict with eslint and prettier rules.
**Action:** Always be careful with regex escape sequences in inline jsx. When writing a regex in a tsx file via python scripts, ensure escaping doesn't trigger `no-useless-escape` eslint errors. Use a dedicated `patch_regex.py` to fix it locally if needed, or define the regex outside jsx.

## 2024-05-18 - Backend integration for Music Search

**Learning:** Added an API route with `@tanstack/react-start/api` and updated the frontend to debounce user input and call the API, handling loading and empty states cleanly.
**Action:** Be mindful of subtle regressions when doing find-and-replace, such as the `payload.news.title` typo introduced by a script execution. Always run a diff before committing to catch unrelated changes.

## 2024-05-18 - Fix TanStack Start API Route Import

**Learning:** In newer versions of TanStack Start (v1.168+), `createAPIFileRoute` from `@tanstack/react-start/api` is no longer available. API routes must be defined using `createFileRoute` from `@tanstack/react-router` with a `server: { handlers: { GET: ... } }` block, and returning responses via `Response.json()` instead of the exported `json` helper.
**Action:** When working with TanStack router or start in the future, carefully check the package version and adhere to the newer server functions or `createFileRoute({ server })` syntax rather than legacy API routes imports.

## 2024-05-18 - Implemented Music Search with YouTube API

**Learning:** Successfully implemented a music search feature using the YouTube Data API v3. Used debouncing to avoid excessive API requests. Filtered results correctly and retrieved duration, which is useful for displaying a compact view on a post. Encountered an issue where ESLint and Prettier had format conflicting issues.

**Action:** Before running tests or lint commands after using `sed` or bash scripts, run `bun run format` to make sure formatting is correct, then run `bun run lint` and `npx tsc --noEmit` to ensure type checks.

## 2026-07-21 - Implemented Music Search

**Learning:** When developing the user interface with React for the music feature, I discovered the YouTube Data API is needed to resolve links properly. I encountered issues testing with playwright.

**Action:** Used `setTimeout` functionality to fix rendering issues with react elements updating properties out of sync. Attempted verifying the tests but failed.

## 2026-07-21 - API Authentication Testing

**Learning:** When developing an API backend dependent on external services, you can temporarily hardcode a mock JSON payload inside a route if the environment lacks the API key to keep the frontend workflow verifiable, then remove it later once an environment key is supplied.
**Action:** Be mindful of doing manual text replacements via Python scripts. Reverting script changes with regular expressions can be brittle. It's often safer to use version control `git checkout` to restore specific files instead of writing a reverse regex patch.

## 2026-07-21 - API Authentication Testing 2

**Learning:** Restarting dev servers is critical when updating environment variables in frameworks like Vite. Testing from the backend route using cURL is an effective way to isolate whether an issue is API-related vs frontend-related when you encounter 500 status codes.
**Action:** In future interactions when an environment key is updated, I should explicitly remind the user to restart their development server (like `npm run dev`) since the server instance won't hot-reload environment file changes.

## 2026-07-21 - TanStack Start createServerFn vs API Routes

**Learning:** When using TanStack Start, relying on manually defined API routes (e.g. `createFileRoute('/api/...')` with `server.handlers`) can cause failures in certain deployments or client environments where the route isn't caught correctly by the router or when `process.env` isn't fully polyfilled by Vite. Converting the backend logic into an explicit RPC call using `createServerFn` natively resolves these networking and environment variable resolution issues.
**Action:** When working in TanStack Start 1.x+, always prefer `createServerFn` for backend logic (fetching external APIs, interacting with a database) instead of creating standard REST-like API routes, as RPC functions are natively handled, fully typed, and more resilient across deployment environments.

## 2026-07-21 - Fix TanStack Start searchYoutubeFn GET bug and React Error #418
**Learning:** `createServerFn` defaults to `GET`, which can cause issues with how `fetch` requests handle early unmounts when connected to a query listener inside `useEffect` (e.g. `Error: A listener indicated an asynchronous response by returning true, but the message channel closed`). Setting it to `POST` fixes this error since it bypasses the strict `fetch` GET cancellation when routing.
Also, `Math.random()` and `new Date()` within initial render inside server-rendered React applications cause Hydration Error #418.
**Action:** Use `method: "POST"` for `createServerFn` to avoid connection drops during debounce unmounting. Hydrate dates using `useEffect` after mount, and avoid using dynamic variables inside `React.useMemo` when rendering on both server and client.

## 2026-07-21 - TanStack Router SSR & Hydration

**Learning:** Using `ssr: false` in `@tanstack/react-router` wrap components inside `<Suspense>` on the server. When the client loads the javascript, it mounts the component. However, React compares the initial tree (which had `Suspense`) to the generated one (which is the actual `AuthPage` container) and fails with Error #418 (Hydration Mismatch). The solution was removing `ssr: false` from routes unless specifically using defer mechanisms.
**Action:** When migrating TanStack Start apps, avoid placing `ssr: false` directly in standard routes unless specifically loading client-only SDKs explicitly mapped to a specific skeleton UI or utilizing generic component fallbacks.
