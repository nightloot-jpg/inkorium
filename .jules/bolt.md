Completed tests and fixed UI Event issues

## 2026-07-23 - EventData Type safety on .maybeSingle() Queries

**Learning:** Replacing `.single()` with `.maybeSingle()` prevents Supabase from throwing HTTP 406 when no row is found, which is great. However, it changes the type of the returned data from `Data` to `Data | null`. This causes downstream errors in TypeScript components and hooks since they attempt to access properties of potentially `null` objects (e.g. `event.id`).
**Action:** When updating `.single()` to `.maybeSingle()`, always ensure we either add an early exit condition `if (!event) throw new Error("Event not found")` (if the route or component absolutely requires the data) or provide fallbacks `event?.id ?? null` and check for the `null` state appropriately.
## 2024-07-23 - Event Integrations Data Modeling & Type Fallbacks
**Learning:** Hard-crashing issues can frequently occur when accessing complex or nested nested Supabase properties (e.g. `event.date`, `event.time` which didn't match the `events` table `event_date`, `event_time`) or missing default checks (e.g. `.split()` crashes on `null` / `undefined`). Supabase returns `null` or omits fields when they don't match, causing runtime TypeErrors during render phases or data mapping.
**Action:** Always provide explicit fallbacks inline for properties coming from Supabase records that might be empty or missing (e.g. `(event.event_date || new Date())`, `(event.name || "Evento sin título")`), and always safely guard built-in methods like `.split()` (e.g. `(val || "").split()`).
## 2024-07-23 - Router Data Fallbacks
**Learning:** Returning `throw new Error()` inside layout loaders that handle root paths (e.g., `eventos/route.tsx` for `/eventos`) can unintentionally crash the entire page layout if the `eventId` is a mocked/dummy ID during root navigation. This breaks the instruction that the app should never crash on missing events.
**Action:** Always prefer `if (!data) return null;` or similar graceful fallback behaviors in layout loader definitions over throwing raw Exceptions, especially when the layout encompasses index and generic views that don't depend on the explicit single record.
