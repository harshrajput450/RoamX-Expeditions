# RoamX Content Source Investigation

## 1. Problem Summary

The unexpected trips and reviews are present in the current workspace as code-controlled demo/seed content. They are not exclusively coming from an external CMS or database.

The live Netlify page was fetched during this investigation and displays the same content found locally, including:

- `Kedarkantha Winter Snow Trek`
- `Spiti Valley Winter White Expedition`
- `Kasol, Tosh & Kheerganga Natural Hot Spring Trek`
- `VARANASI — THE CITY OF STORIES`
- `RISHIKESH × MUSSOORIE × LANDOUR`
- `PUSHKAR — DESERT SOUL`
- `VRINDAVAN — STORIES OF THE CITY`
- `BADRINATH — INTO THE HIMALAYAS`
- `CHAKRATA — OFF THE MAP`
- Seven named reviews including Aakash Sharma, Pooja Hegde, Varun Verma, Sneha Roy, Ananya Deshmukh, Kabir Singhania, and Riddhi Kulkarni.

The live page therefore matches the current static/demo source closely enough to conclude that the unwanted content is included in the deployed application bundle, or is being returned by the deployed API using the same seed data. Netlify's dashboard and runtime environment were not directly accessible from this workspace, so the exact deployed environment-variable state and deploy commit cannot be independently verified here.

## 2. Trips Data Source

### Primary hardcoded source

- **File:** `src/data/mockTrips.ts`
- **Variable:** `initialTrips`
- **Source type:** Hardcoded TypeScript array imported into the React application.
- **Rendered by:** `src/App.tsx`, which initializes `trips` with `useState<Trip[]>(initialTrips)`.
- **Downstream components:** `HeroSection`, `TripHighlightsGrid`, `DepartureCitiesSelector`, `VerticalItineraryTimeline`, `GallerySection`, `InclusionsExclusions`, `ThingsToCarry`, `OtherTripsSection`, `Navbar`, and `GlobalSearchBar` receive trip data from `App.tsx`.

The first object in `initialTrips` is the live-looking Kedarkantha package. It contains its title, descriptions, prices, destinations, seats, dates, itinerary, highlights, inclusions, exclusions, and Unsplash image URLs. The same file contains the additional expedition objects shown in the catalog.

The initial hero selection in `src/App.tsx` searches `initialTrips` for a featured/live/published trip. This means the UI can display a trip before any API request succeeds.

### Local JSON source

- **File:** `data/roamx-db.json`
- **Fields:** `liveTripId`, `trips`, `reviews`, `announcements`, and `inquiries`
- **Source type:** Local persistent JSON store used by the server fallback.

This file also contains trip records, including the catalog content. It is not a remote database. On a normal local Node process, `server/db.ts` loads it at module startup.

### API source

- **Endpoint:** `GET /api/trips`
- **Handler:** `server/app.ts`
- **Service:** `getTrips()` in `server/db.ts`
- **Potential database:** Supabase PostgreSQL through `server/supabase.ts`

However, `getTrips()` does not guarantee database-only behavior:

1. If Supabase is unavailable, it returns the in-memory trips loaded from `data/roamx-db.json` or seeded from `initialTrips`.
2. If Supabase returns an empty table, it automatically seeds Supabase from `initialTrips`.
3. If the Supabase request fails, it returns the in-memory trips.

Therefore, even when the frontend fetches `/api/trips`, the response can still be generated from local/demo code rather than Supabase.

## 3. Reviews/Testimonial Data Source

### Primary hardcoded source

- **File:** `src/data/mockReviews.ts`
- **Variable:** `mockReviews`
- **Source type:** Hardcoded TypeScript array.
- **Rendered by:** `src/components/ReviewsSection.tsx`.

`ReviewsSection` initializes its state from `localStorage` when available and otherwise returns `mockReviews`. The seven current records include:

- Aakash Sharma, Mumbai: `Summit Push at 3 AM was Unreal!`
- Pooja Hegde, Pune: `Flawless Logistics & Magic at Juda Ka Talab`
- Varun Verma, Delhi: `Frozen Spiti in 4x4 - Unmatched Adventure`
- Sneha Roy, Bengaluru: `Safest & Best Solo Trip Experience`
- Ananya Deshmukh, Mumbai: `Mana Village & Badrinath were divine!`
- Kabir Singhania, Delhi: `Rafting + Landour Bakehouse is the Best Combo`
- Riddhi Kulkarni, Jaipur: `Subah-e-Banaras Boat Ride was Unforgettable`

The records include names, cities, ratings, dates, review text, trip IDs, trip names, verification flags, avatars, and photo URLs.

### Browser local-storage source

- **Key:** `roamx_community_reviews`
- **File:** `src/components/ReviewsSection.tsx`
- **Source type:** Browser-persisted JSON cache.

On initial render, the component reads this key before the API request completes. A previous visitor/admin session can therefore make reviews appear even if the API is unavailable or has no records. The component also writes API results and locally-created review results back to this key.

### API/database source

- **Endpoint:** `GET /api/reviews`
- **Handler:** `server/app.ts`
- **Service:** `getReviews()` in `server/db.ts`
- **Database:** Supabase PostgreSQL when configured

The backend has the same fallback behavior as trips:

1. Without Supabase, it returns in-memory reviews loaded from `data/roamx-db.json` or seeded from `mockReviews`.
2. If Supabase reviews are empty, it automatically upserts `mockReviews` into Supabase.
3. If the Supabase query fails, it returns the in-memory reviews.

Thus the API can make demo reviews permanent in the configured Supabase project, and the frontend can also show them from `mockReviews` or localStorage without a successful API response.

### Review submission path

`ReviewsSection` submits new reviews to `POST /api/reviews`. The server's `createReview()` uploads images to Supabase Storage when available and inserts the review into Supabase. When Supabase is unavailable or insertion fails, it stores the review in the in-memory array instead. This is another non-database fallback.

## 4. API/Database Investigation

### Supabase

- **Client:** `server/supabase.ts`
- **Environment variables:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are documented in `.env.example`.
- **Server tables:** `trips`, `reviews`, `inquiries`, and `announcements`, defined in `schema.sql`.
- **Storage bucket:** `roamx-media`, used for trip/review/avatar images.

The server prefers `SUPABASE_SERVICE_ROLE_KEY` and falls back to `SUPABASE_ANON_KEY`. The service-role key is intended for server use, but the codebase must be checked in the deployed environment to ensure it is not exposed through Vite client variables.

### Relevant API routes

- `GET /api/trips`: catalog trips.
- `GET /api/trips/live`: live trip.
- `GET /api/homepage-settings`: homepage/live-trip settings.
- `GET /api/reviews`: reviews.
- `POST /api/reviews`: public review creation.
- `GET /api/announcements` and `/api/announcements/active`: announcement content.
- `GET /api/inquiries`: private booking/inquiry records, currently exposed by the route implementation without an obvious auth check in the current source.
- `POST /api/inquiries`: customer inquiry creation.

### Other external services

- Gemini AI: `@google/genai`, called by `/api/ai/chat` using `GEMINI_API_KEY`.
- Razorpay: payment order and verification code in `server/razorpay.ts` and `server/app.ts`.
- Supabase Storage and Unsplash URLs: image sources.

No Firebase integration was found in the inspected workspace. No Axios usage was found; API calls use the browser `fetch()` API.

## 5. Netlify Deployment Investigation

### Current local deployment configuration

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`
- **API rewrite:** `/api/*` to `/.netlify/functions/api/:splat`
- **SPA rewrite:** all other paths to `/index.html`
- **Vite config:** `vite.config.ts` uses React, Tailwind, and the `@` alias. It does not define data content or an API proxy.
- **Package scripts:** `build` runs `vite build` and bundles `server.ts` with esbuild; `dev` runs `tsx server.ts`.

### Important deployment distinction

The Netlify build publishes the Vite `dist` output. The server bundle is also produced locally by the build script, but Netlify's API behavior depends on the function entry under `netlify/functions/api.ts` and its environment variables. The frontend's initial static state is already enough to show the trip catalog and reviews before an API response succeeds.

### What was verified

The live Netlify URL was fetched and displayed the same Kedarkantha content, the same expedition names, and the same seven reviews as the current local mock files. This strongly indicates the deployed artifact is based on the current repository content or an equivalent build containing that content.

### What could not be verified

The following require access to Netlify's dashboard or deploy metadata:

- The exact Git commit deployed at `agent-6aaba91684e8c9c0f937ea35--roamx.netlify.app`.
- Whether the site is connected to the GitHub repository's `main` branch or another branch/commit.
- Whether `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and other variables are set in Netlify.
- Whether the deployed function is returning Supabase rows or local fallback rows.
- Whether an external Supabase project already contains these records.

The local directory is not a Git working tree, so a local `git log`/`git diff` comparison against GitHub was not available.

## 6. Exact Recommended Fix

Do not remove content blindly until deciding whether the source-of-truth data should be kept or replaced.

To remove the unwanted/demo content from production:

1. Remove or replace the `initialTrips` import and initial state in `src/App.tsx`. Initialize with an empty state and render an explicit empty/loading/error state until `/api/trips` succeeds.
2. Remove the `mockReviews` and localStorage initialization in `src/components/ReviewsSection.tsx`. Reviews should begin as an empty list and be populated only by `/api/reviews`.
3. Remove review localStorage fallback writes if Supabase is required to be the source of truth.
4. Remove `initialTrips`, `mockReviews`, and `initialAnnouncements` imports and seed paths from `server/db.ts`.
5. Disable `data/roamx-db.json` loading and all in-memory persistence in production/serverless deployments.
6. Remove automatic `initialTrips` and `mockReviews` upserts into Supabase. If the Supabase tables are empty, return an empty result instead of seeding demo content.
7. Inspect the Supabase project directly and delete/archive only the unwanted rows from `trips` and `reviews`. The local code cannot prove whether the production Supabase database contains additional rows.
8. Add server-side authentication/authorization before exposing private inquiries and before allowing admin mutation routes.
9. Deploy the approved commit, then confirm Netlify's deploy log identifies that commit and that the function environment points to the intended Supabase project.

## 7. Safety Checks

Before and after any removal:

- Export or back up the Supabase `trips` and `reviews` tables.
- Record the IDs of content intended for removal; do not delete by display title alone.
- Search every component for references to the affected trip IDs and review IDs.
- Confirm the homepage still has a deliberate empty state when no trip is configured.
- Confirm the hero, trip cards, search, departure selectors, itinerary, gallery, booking form, and reviews section render without undefined-trip errors.
- Confirm `GET /api/trips` and `GET /api/reviews` return only approved Supabase rows.
- Clear browser storage when testing so old `roamx_community_reviews` records cannot mask the result.
- Verify the Netlify deploy commit and inspect the browser Network panel for `/api/trips` and `/api/reviews` responses.
- Test a clean incognito session and a fresh deployment after the database cleanup.
- Verify that admin-created content persists after refresh and that public visitors cannot see private inquiry data.

## Conclusion

The unwanted content is demonstrably present in the current source code and local JSON data, not merely an unexplained external artifact. The live site reproduces that same content. The current architecture can also copy those records into Supabase or serve them from Supabase, so the final production source may be a combination of static bundle, local fallback, and database rows. The exact production database rows and deployed environment variables require Netlify/Supabase dashboard access to verify.
