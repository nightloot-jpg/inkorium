Completed tests and fixed UI Event issues
## 2026-07-23 - EventData Type safety on .maybeSingle() Queries
**Learning:** Replacing `.single()` with `.maybeSingle()` prevents Supabase from throwing HTTP 406 when no row is found, which is great. However, it changes the type of the returned data from `Data` to `Data | null`. This causes downstream errors in TypeScript components and hooks since they attempt to access properties of potentially `null` objects (e.g. `event.id`).
**Action:** When updating `.single()` to `.maybeSingle()`, always ensure we either add an early exit condition `if (!event) throw new Error("Event not found")` (if the route or component absolutely requires the data) or provide fallbacks `event?.id ?? null` and check for the `null` state appropriately.
