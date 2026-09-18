# RoamX Demo Data Fix Plan

## Scope

Make Supabase the only source of truth for trips and reviews without changing the existing visual design, layout, styling, animations, booking UI, or unrelated integrations.

## 1. Files To Modify

- `src/App.tsx`
  - Remove `initialTrips` and initial announcement/trip content from production state.
  - Start trips empty/loading.
  - Fetch trips from `GET /api/trips`.
  - Add safe loading, empty, and API-error handling before rendering trip-dependent components.
- `src/components/ReviewsSection.tsx`
  - Remove `mockReviews` and `roamx_community_reviews` as content sources.
  - Start reviews empty/loading and replace state only from `GET /api/reviews`.
  - Remove local review persistence fallback while preserving successful API submission behavior.
- `src/data/mockTrips.ts`
  - Keep only if other non-production tooling still references it; remove production imports first.
- `src/data/mockReviews.ts`
  - Keep only if other non-production tooling still references it; remove production imports first.
- `server/db.ts`
  - Remove local JSON loading, mock imports, demo seed records, automatic Supabase seeding, and memory-array fallback for trips/reviews.
  - Make trip/review reads database-only.
  - Preserve legitimate Supabase inserts for admin-created content and public review submission.
  - Remove announcement demo seeding/fallback from this server data layer as part of the identified seed cleanup.
- `server/supabase.ts`
  - Preserve the existing Supabase client contract; only adjust behavior if required to prevent silent fallback.
- `SUPABASE_CONTENT_CLEANUP.md`
  - Add safe SELECT queries and clearly marked optional DELETE queries. No destructive query will be executed.

Potentially removed only after usage verification:

- `data/roamx-db.json`
- `src/data/mockTrips.ts`
- `src/data/mockReviews.ts`

## 2. Exact Demo Data Sources

- `src/data/mockTrips.ts`: `initialTrips`, including the nine catalog trips.
- `src/data/mockReviews.ts`: `mockReviews`, including seven named reviews.
- `data/roamx-db.json`: local trips, reviews, announcements, and seeded inquiry records.
- `src/App.tsx`: initial `trips` state and hero selection from `initialTrips`.
- `src/components/ReviewsSection.tsx`: initial localStorage/mock review state and local persistence fallback.
- `server/db.ts`: local store initialization, in-memory arrays, Supabase seed upserts, and fallback returns.

## 3. Automatic Seeding Logic Found

- `getTrips()` upserts `initialTrips` into Supabase when the trips query is empty.
- `getReviews()` upserts `mockReviews` into Supabase when the reviews query is empty.
- `getAnnouncements()` upserts `initialAnnouncements` into Supabase when announcements are empty.
- `loadInitialStore()` creates `data/roamx-db.json` from the mock arrays when the file is absent or invalid.

These paths will be removed or disabled. Legitimate `createTrip()` and `createReview()` inserts will remain.

## 4. Fallback Logic Found

- Frontend trips begin with `initialTrips` before the API returns.
- Frontend reviews begin with `localStorage` or `mockReviews` before the API returns.
- Review submission creates and stores a local review when the API fails.
- Backend reads return in-memory arrays when Supabase is missing or errors.
- Backend reads use `data/roamx-db.json` and mock arrays to populate those memory arrays.
- Backend trip/review APIs can therefore return content that is not an actual current Supabase row.

## 5. Potential Risks

- Removing initial trips makes `activeTrip` undefined until the API responds; App must guard all trip-dependent rendering.
- Empty Supabase tables must show a stable empty state rather than crash or render partial booking UI.
- API failures must show an error state and must not resurrect browser-cached or local demo content.
- Existing legitimate rows in Supabase must not be deleted by application code.
- Admin-created trips/reviews must continue using the existing POST/update paths and persist in Supabase.
- Existing server logic also handles announcements and inquiries; unrelated behavior should remain intact except for demo fallback removal.
- The production Supabase project may already contain demo rows from prior automatic seeding; those require manual inspection and an explicit user-approved cleanup query.

## 6. Supabase-Only Source Of Truth

1. Browser initializes trips and reviews as empty/loading.
2. Browser requests `/api/trips` and `/api/reviews`.
3. Server queries Supabase tables and returns only those rows.
4. Empty tables return empty arrays.
5. Supabase errors return API errors; no local JSON, mock arrays, or memory cache is returned.
6. Successful admin/customer writes continue through existing database insert/update operations.
7. Browser localStorage is not used to provide review content.

## 7. Testing Checklist

- Run `npm run lint`.
- Run `npm run build`.
- Search for production imports/usages of `initialTrips` and `mockReviews`.
- Search for automatic demo `upsert`/seed paths.
- Confirm `/api/trips` returns only Supabase rows.
- Confirm `/api/reviews` returns only Supabase rows.
- With empty tables, confirm the UI shows a no-trips/no-reviews state.
- With API failure, confirm no mock/localStorage content appears.
- Confirm legitimate Supabase trips and reviews render.
- Confirm admin-created trips/reviews persist after refresh.
- Test in a clean/incognito browser and clear `roamx_community_reviews` when validating old clients.
- Confirm no UI styling or layout files changed.
- Inspect Netlify deployment environment variables and deployed commit separately; this workspace cannot validate the live Supabase project contents.
