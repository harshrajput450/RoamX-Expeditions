-- =================================================================
-- ROAMX EXPEDITIONS PRODUCTION DATABASE SCHEMA (Supabase PostgreSQL)
-- =================================================================

-- 1. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tagline TEXT,
    location TEXT,
    duration TEXT,
    difficulty TEXT DEFAULT 'Moderate',
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    hero_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    departure_cities JSONB DEFAULT '[]'::jsonb,
    itinerary JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    inclusions JSONB DEFAULT '[]'::jsonb,
    exclusions JSONB DEFAULT '[]'::jsonb,
    things_to_carry JSONB DEFAULT '[]'::jsonb,
    batches JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    age_limit TEXT DEFAULT '18 to 30 Years',
    max_altitude TEXT,
    group_size TEXT DEFAULT '12 - 16 Trekkers',
    best_season TEXT,
    rating NUMERIC DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT DEFAULT 'India',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    date TEXT NOT NULL,
    title TEXT,
    comment TEXT NOT NULL,
    avatar TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    trip_id TEXT REFERENCES public.trips(id) ON DELETE SET NULL,
    trip_name TEXT DEFAULT 'RoamX Expedition',
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INQUIRIES & BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    trip_booking_id TEXT,
    trip_id TEXT NOT NULL,
    trip_title TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    date_of_birth TEXT,
    age INTEGER,
    gender TEXT DEFAULT 'Male',
    travelers_count INTEGER DEFAULT 1,
    departure_city TEXT NOT NULL,
    selected_month TEXT,
    selected_date TEXT,
    calculated_price NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    payment_status TEXT DEFAULT 'Unpaid',
    utr_number TEXT,
    payment_method TEXT,
    message TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    link TEXT DEFAULT '#booking-section',
    badge TEXT DEFAULT 'OFFER',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_reviews_trip_id ON public.reviews(trip_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_trip_booking_id ON public.inquiries(trip_booking_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_utr_number ON public.inquiries(utr_number);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active);

-- =================================================================
-- SUPABASE STORAGE BUCKET CREATION (Public Read)
-- =================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('roamx-media', 'roamx-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow public read access to all files in roamx-media
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'roamx-media');

-- Storage Policy: Allow insert/uploads (service role or public with bucket constraint)
CREATE POLICY "Allow Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'roamx-media');

-- Storage Policy: Allow deletion
CREATE POLICY "Allow Deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'roamx-media');

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read of trips, reviews, announcements
CREATE POLICY "Public Read Trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);

-- Allow public review submission
CREATE POLICY "Public Create Review" ON public.reviews FOR INSERT WITH CHECK (true);

-- Allow public inquiry submission
CREATE POLICY "Public Create Inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);

-- Allow service role / full access for backend API operations
CREATE POLICY "Service Role Trips" ON public.trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
