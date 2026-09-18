# Supabase Content Cleanup

These queries match the supplied `trips`, `reviews`, `inquiries`, and `announcements` schemas. The inspection queries are read-only. No destructive query has been executed.

## 1. Inspect Trips

The supplied `trips` schema has `is_featured`, but it does not have `slug`, `status`, or `is_live` columns.

```sql
SELECT
  id,
  title,
  tagline,
  location,
  duration,
  difficulty,
  price,
  original_price,
  hero_image,
  departure_cities,
  batches,
  rating,
  reviews_count,
  is_featured,
  created_at,
  updated_at
FROM public.trips
ORDER BY created_at ASC NULLS FIRST, id ASC;
```

## 2. Inspect Reviews

```sql
SELECT
  id,
  name,
  city,
  rating,
  date,
  title,
  comment,
  trip_id,
  trip_name,
  is_verified,
  created_at
FROM public.reviews
ORDER BY created_at ASC NULLS FIRST, id ASC;
```

## 3. Inspect Inquiries

The supplied `inquiries` schema does not include Razorpay-specific columns. Use the following query for the available booking fields.

```sql
SELECT
  id,
  trip_booking_id,
  trip_id,
  trip_title,
  name,
  phone,
  email,
  date_of_birth,
  age,
  gender,
  travelers_count,
  departure_city,
  selected_month,
  selected_date,
  calculated_price,
  paid_amount,
  payment_status,
  utr_number,
  payment_method,
  status,
  created_at
FROM public.inquiries
ORDER BY created_at DESC NULLS LAST, id ASC;
```

## 4. Inspect Announcements

```sql
SELECT
  id,
  text,
  link,
  badge,
  is_active,
  created_at
FROM public.announcements
ORDER BY created_at DESC NULLS LAST, id ASC;
```

## 5. Inspect Known Repository Demo Records

These queries are read-only filters based on the repository-authored IDs and names identified during investigation. Review every result before taking action.

```sql
SELECT
  id,
  title,
  location,
  price,
  rating,
  reviews_count,
  is_featured,
  created_at,
  updated_at
FROM public.trips
WHERE id IN (
  'kedarkantha-trek',
  'spiti-valley-expedition',
  'kasol-kheerganga',
  'varanasi-heritage-yatra',
  'rishikesh-mussoorie-landour',
  'pushkar-ajmer-odyssey',
  'vrindavan-mathura-spiritual',
  'badrinath-yatra-expedition',
  'chakrata-jaunsar'
)
ORDER BY created_at ASC NULLS FIRST, id ASC;
```

```sql
SELECT
  id,
  name,
  city,
  rating,
  date,
  title,
  trip_id,
  trip_name,
  is_verified,
  created_at
FROM public.reviews
WHERE id IN ('rev-1', 'rev-2', 'rev-3', 'rev-4', 'rev-5', 'rev-6', 'rev-7')
   OR name IN (
     'Aakash Sharma',
     'Pooja Hegde',
     'Varun Verma',
     'Sneha Roy',
     'Ananya Deshmukh',
     'Kabir Singhania',
     'Riddhi Kulkarni'
   )
ORDER BY created_at ASC NULLS FIRST, id ASC;
```

## 6. Related Records And Integrity Checks

### Reviews linked to each trip

```sql
SELECT
  t.id AS trip_id,
  t.title,
  COUNT(r.id) AS review_count
FROM public.trips AS t
LEFT JOIN public.reviews AS r ON r.trip_id = t.id
GROUP BY t.id, t.title
ORDER BY t.title ASC;
```

### Reviews whose trip no longer exists

```sql
SELECT
  r.id,
  r.name,
  r.trip_id,
  r.trip_name,
  r.created_at
FROM public.reviews AS r
LEFT JOIN public.trips AS t ON t.id = r.trip_id
WHERE r.trip_id IS NOT NULL
  AND t.id IS NULL
ORDER BY r.created_at ASC NULLS FIRST;
```

### Duplicate-looking review names and titles

```sql
SELECT
  name,
  title,
  COUNT(*) AS row_count,
  MIN(created_at) AS first_created_at,
  MAX(created_at) AS last_created_at
FROM public.reviews
GROUP BY name, title
HAVING COUNT(*) > 1
ORDER BY row_count DESC, name ASC;
```

## 7. Optional Deletes, Only After Manual Approval

Do not run these until each returned row has been confirmed as unwanted demo content and legitimate records have been backed up. Replace the placeholder IDs with explicitly approved IDs only.

Because `reviews.trip_id` references `trips.id` with `ON DELETE SET NULL`, deleting a trip will detach related reviews rather than delete them. Delete reviews separately only when they are also approved for removal.

```sql
-- Optional: delete explicitly approved reviews first.
DELETE FROM public.reviews
WHERE id IN (
  'replace-with-approved-review-id'
);
```

```sql
-- Optional: delete explicitly approved trips after reviewing linked reviews.
DELETE FROM public.trips
WHERE id IN (
  'replace-with-approved-trip-id'
);
```

```sql
-- Optional: delete explicitly approved announcements.
DELETE FROM public.announcements
WHERE id IN (
  'replace-with-approved-announcement-id'
);
```

Do not delete inquiries automatically. They contain customer and booking information and require separate business approval.

## 8. Verification After Cleanup

```sql
SELECT COUNT(*) AS trip_count FROM public.trips;
SELECT COUNT(*) AS review_count FROM public.reviews;
SELECT COUNT(*) AS inquiry_count FROM public.inquiries;
SELECT COUNT(*) AS announcement_count FROM public.announcements;
```

Then verify the deployed `/api/trips` and `/api/reviews` responses and test in a clean browser profile. The frontend no longer uses `roamx_community_reviews` as a content source, so an old browser cache cannot repopulate the review list.
