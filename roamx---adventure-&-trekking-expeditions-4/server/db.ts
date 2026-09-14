import fs from 'fs';
import path from 'path';
import { Trip, Review, BookingInquiry, AnnouncementStrip, DepartureCity } from '../src/types';
import { initialTrips } from '../src/data/mockTrips';
import { mockReviews } from '../src/data/mockReviews';
import { initialAnnouncements } from '../src/data/mockAnnouncements';
import { getSupabase, uploadImageToStorage, deleteImageFromStorage, isBase64DataUrl } from './supabase';

// Persistent Local File DB setup to guarantee survival across restarts & sessions
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'roamx-db.json');

function ensureDataDirExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('⚠️ Could not create data directory:', e);
  }
}

interface LocalStoreSchema {
  liveTripId: string;
  trips: Trip[];
  reviews: Review[];
  announcements: AnnouncementStrip[];
  inquiries: BookingInquiry[];
}

function loadInitialStore(): LocalStoreSchema {
  ensureDataDirExists();
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.trips) && parsed.trips.length > 0) {
        return {
          liveTripId: parsed.liveTripId || parsed.trips.find((t: Trip) => t.isLive)?.id || 'kedarkantha-trek',
          trips: parsed.trips,
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : mockReviews,
          announcements: Array.isArray(parsed.announcements) ? parsed.announcements : initialAnnouncements,
          inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
        };
      }
    }
  } catch (err) {
    console.warn('⚠️ Error loading local DB file, falling back to seed data:', err);
  }

  // Default seed store
  const defaultLiveId = 'kedarkantha-trek';
  const seededTrips = initialTrips.map((t) => ({
    ...t,
    isLive: t.id === defaultLiveId,
  }));

  const initialStore: LocalStoreSchema = {
    liveTripId: defaultLiveId,
    trips: seededTrips,
    reviews: JSON.parse(JSON.stringify(mockReviews)),
    announcements: JSON.parse(JSON.stringify(initialAnnouncements)),
    inquiries: [
      {
        id: 'inq-seed-1',
        tripBookingId: 'RX-KED-84920',
        tripId: 'kedarkantha-trek',
        tripTitle: 'Kedarkantha Winter Snow Trek',
        name: 'Rohan Verma',
        phone: '+91 98765 43210',
        email: 'rohan.v@example.com',
        gender: 'Male',
        dateOfBirth: '2001-05-12',
        age: 25,
        travelersCount: 1,
        departureCity: 'Delhi',
        selectedMonth: 'December 2026',
        selectedDate: 'Dec 18 - Dec 22',
        calculatedPrice: 8499,
        paidAmount: 500,
        paymentStatus: 'Verified',
        utrNumber: 'UTR482910592810',
        paymentMethod: 'UPI QR Verified',
        message: 'Looking forward to summit push!',
        status: 'Confirmed',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
  };

  saveStoreToFile(initialStore);
  return initialStore;
}

function saveStoreToFile(store: LocalStoreSchema) {
  ensureDataDirExists();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Failed to save store to file:', err);
  }
}

const loaded = loadInitialStore();
let currentLiveTripId: string = loaded.liveTripId;
let memoryTrips: Trip[] = loaded.trips;
let memoryReviews: Review[] = loaded.reviews;
let memoryAnnouncements: AnnouncementStrip[] = loaded.announcements;
let memoryInquiries: BookingInquiry[] = loaded.inquiries;

function persistMemory() {
  saveStoreToFile({
    liveTripId: currentLiveTripId,
    trips: memoryTrips,
    reviews: memoryReviews,
    announcements: memoryAnnouncements,
    inquiries: memoryInquiries,
  });
}

let isTripsSeeded = false;
let isReviewsSeeded = false;
let isAnnouncementsSeeded = false;

// ==========================================
// TRIPS MAPPER
// ==========================================
function mapRowToTrip(row: any): Trip {
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    tagline: row.tagline || row.short_description || '',
    shortDescription: row.short_description || row.tagline || '',
    longDescription: row.long_description || '',
    location: row.location || row.destination || '',
    destination: row.destination || row.location || '',
    category: row.category || 'Mountain Escapes',
    tags: Array.isArray(row.tags) ? row.tags : [],
    experienceRatings: row.experience_ratings || (row.experienceRatings ? row.experienceRatings : undefined),
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    duration: row.duration || '',
    difficulty: row.difficulty || 'Moderate',
    price: Number(row.price) || 0,
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    totalSeats: row.total_seats ? Number(row.total_seats) : 16,
    bookedSeats: row.booked_seats ? Number(row.booked_seats) : 0,
    availableSeats: row.available_seats !== undefined ? Number(row.available_seats) : (row.total_seats ? Number(row.total_seats) - (Number(row.booked_seats) || 0) : 16),
    bookingDeadline: row.booking_deadline || undefined,
    status: row.status || (row.is_live ? 'published' : 'draft'),
    heroImage: row.hero_image || row.featured_image || '',
    featuredImage: row.featured_image || row.hero_image || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    departureCities: Array.isArray(row.departure_cities) ? row.departure_cities : [],
    itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    inclusions: Array.isArray(row.inclusions) ? row.inclusions : (Array.isArray(row.included) ? row.included : []),
    included: Array.isArray(row.included) ? row.included : (Array.isArray(row.inclusions) ? row.inclusions : []),
    exclusions: Array.isArray(row.exclusions) ? row.exclusions : (Array.isArray(row.excluded) ? row.excluded : []),
    excluded: Array.isArray(row.excluded) ? row.excluded : (Array.isArray(row.exclusions) ? row.exclusions : []),
    thingsToCarry: Array.isArray(row.things_to_carry) ? row.things_to_carry : (Array.isArray(row.packing_list) ? row.packing_list : []),
    packingList: Array.isArray(row.packing_list) ? row.packing_list : (Array.isArray(row.things_to_carry) ? row.things_to_carry : []),
    accommodation: row.accommodation || '',
    transport: row.transport || '',
    activities: Array.isArray(row.activities) ? row.activities : [],
    pickupPoint: row.pickup_point || '',
    dropPoint: row.drop_point || '',
    tripLeader: row.trip_leader || '',
    batches: Array.isArray(row.batches) ? row.batches : [],
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    importantInformation: Array.isArray(row.important_information) ? row.important_information : [],
    safetyInformation: Array.isArray(row.safety_information) ? row.safety_information : [],
    cancellationPolicy: row.cancellation_policy || '',
    ageLimit: row.age_limit || '18 to 35 Years',
    maxAltitude: row.max_altitude || '',
    groupSize: row.group_size || '12 - 16 Trekkers',
    bestSeason: row.best_season || '',
    rating: Number(row.rating) || 4.9,
    reviewsCount: Number(row.reviews_count) || 0,
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    is_featured: Boolean(row.is_featured ?? row.isFeatured),
    isLive: Boolean(row.is_live ?? row.isLive),
    is_live: Boolean(row.is_live ?? row.isLive),
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

function mapTripToRow(trip: Trip): any {
  return {
    id: trip.id,
    title: trip.title,
    tagline: trip.tagline || trip.shortDescription || '',
    location: trip.location || trip.destination || '',
    duration: trip.duration,
    difficulty: trip.difficulty,
    price: trip.price,
    original_price: trip.originalPrice || null,
    hero_image: trip.heroImage || trip.featuredImage || '',
    gallery: trip.gallery || [],
    departure_cities: trip.departureCities || [],
    itinerary: trip.itinerary || [],
    highlights: trip.highlights || [],
    inclusions: trip.inclusions || trip.included || [],
    exclusions: trip.exclusions || trip.excluded || [],
    things_to_carry: trip.thingsToCarry || trip.packingList || [],
    batches: trip.batches || [],
    faqs: trip.faqs || [],
    age_limit: trip.ageLimit || '18 to 35 Years',
    max_altitude: trip.maxAltitude || '',
    group_size: trip.groupSize || '12 - 16 Trekkers',
    best_season: trip.bestSeason || '',
    rating: trip.rating || 4.9,
    reviews_count: trip.reviewsCount || 0,
    is_featured: Boolean(trip.is_featured ?? trip.isFeatured),
    updated_at: new Date().toISOString(),
  };
}

// ==========================================
// REVIEWS MAPPER
// ==========================================
function mapRowToReview(row: any): Review {
  return {
    id: row.id,
    name: row.name,
    city: row.city || 'India',
    rating: Number(row.rating) || 5,
    date: row.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    title: row.title || undefined,
    comment: row.comment,
    avatar: row.avatar || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    tripId: row.trip_id || undefined,
    tripName: row.trip_name || 'RoamX Expedition',
    isVerified: row.is_verified ?? true,
  };
}

function mapReviewToRow(review: Review): any {
  return {
    id: review.id,
    name: review.name,
    city: review.city || 'India',
    rating: review.rating,
    date: review.date,
    title: review.title || null,
    comment: review.comment,
    avatar: review.avatar || null,
    images: review.images || [],
    trip_id: review.tripId || null,
    trip_name: review.tripName || 'RoamX Expedition',
    is_verified: review.isVerified ?? true,
    created_at: new Date().toISOString(),
  };
}

// ==========================================
// INQUIRIES MAPPER
// ==========================================
function mapRowToInquiry(row: any): BookingInquiry {
  const isRazorpayMethod = row.payment_method === 'Razorpay';
  const paymentId = row.razorpay_payment_id || (isRazorpayMethod ? row.utr_number : undefined);

  return {
    id: row.id,
    tripBookingId: row.trip_booking_id || undefined,
    tripId: row.trip_id,
    tripTitle: row.trip_title,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    age: row.age ? Number(row.age) : undefined,
    gender: row.gender || 'Male',
    travelersCount: Number(row.travelers_count) || 1,
    departureCity: row.departure_city,
    selectedMonth: row.selected_month || undefined,
    selectedDate: row.selected_date || undefined,
    calculatedPrice: Number(row.calculated_price) || 0,
    paidAmount: row.paid_amount ? Number(row.paid_amount) : undefined,
    paymentStatus: row.payment_status || 'Unpaid',
    utrNumber: isRazorpayMethod ? undefined : (row.utr_number || undefined),
    paymentMethod: row.payment_method || (paymentId ? 'Razorpay' : undefined),
    razorpayPaymentId: paymentId || undefined,
    razorpayOrderId: row.razorpay_order_id || undefined,
    razorpaySignature: row.razorpay_signature || undefined,
    message: row.message || undefined,
    status: row.status || 'New',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapInquiryToRow(inquiry: BookingInquiry): any {
  const isRazorpay = inquiry.paymentMethod === 'Razorpay' || Boolean(inquiry.razorpayPaymentId);
  const transactionRef = inquiry.razorpayPaymentId || inquiry.utrNumber || null;

  return {
    id: inquiry.id,
    trip_booking_id: inquiry.tripBookingId || null,
    trip_id: inquiry.tripId,
    trip_title: inquiry.tripTitle,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email || null,
    date_of_birth: inquiry.dateOfBirth || null,
    age: inquiry.age || null,
    gender: inquiry.gender || 'Male',
    travelers_count: inquiry.travelersCount || 1,
    departure_city: inquiry.departureCity,
    selected_month: inquiry.selectedMonth || null,
    selected_date: inquiry.selectedDate || null,
    calculated_price: inquiry.calculatedPrice,
    paid_amount: inquiry.paidAmount || null,
    payment_status: inquiry.paymentStatus || 'Unpaid',
    utr_number: transactionRef,
    payment_method: isRazorpay ? 'Razorpay' : (inquiry.paymentMethod || 'UPI QR Verified'),
    message: inquiry.message || null,
    status: inquiry.status || 'New',
    created_at: inquiry.createdAt || new Date().toISOString(),
  };
}

// ==========================================
// ANNOUNCEMENTS MAPPER
// ==========================================
function mapRowToAnnouncement(row: any): AnnouncementStrip {
  return {
    id: row.id,
    text: row.text,
    link: row.link || '#booking-section',
    badge: row.badge || undefined,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapAnnouncementToRow(ann: AnnouncementStrip): any {
  return {
    id: ann.id,
    text: ann.text,
    link: ann.link,
    badge: ann.badge || null,
    is_active: Boolean(ann.isActive),
    created_at: ann.createdAt || new Date().toISOString(),
  };
}

// =========================================================================
// 1. TRIPS SERVICE
// =========================================================================

export async function getHomepageSettings(): Promise<{ liveTripId: string; liveTrip: Trip | null }> {
  const all = await getTrips();
  const featuredTrip = all.find((t) => t.is_featured === true || t.isFeatured === true);
  const liveTrip = featuredTrip || all.find((t) => t.id === currentLiveTripId || t.isLive) || all[0] || null;
  return {
    liveTripId: liveTrip ? liveTrip.id : '',
    liveTrip,
  };
}

export async function getLiveTrip(): Promise<Trip | null> {
  const { liveTrip } = await getHomepageSettings();
  return liveTrip;
}

export async function getTrips(): Promise<Trip[]> {
  const supabase = getSupabase();
  if (!supabase) {
    // Ensure single live trip
    memoryTrips.forEach((t) => {
      t.isLive = t.id === currentLiveTripId;
    });
    return memoryTrips;
  }

  try {
    const { data, error } = await supabase.from('trips').select('*').order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Supabase getTrips error:', error.message);
      memoryTrips.forEach((t) => {
        t.isLive = t.id === currentLiveTripId;
      });
      return memoryTrips;
    }

    if (!data || data.length === 0) {
      if (!isTripsSeeded) {
        console.log('🌱 Seeding initial trips into Supabase...');
        isTripsSeeded = true;
        const seedRows = initialTrips.map(mapTripToRow);
        const { error: seedError } = await supabase.from('trips').upsert(seedRows, { onConflict: 'id' });
        if (seedError) console.error('❌ Failed to seed trips:', seedError.message);
      }
      return memoryTrips;
    }

    const fetchedTrips = data.map(mapRowToTrip);

    // Sync currentLiveTripId: check if any row has is_live in Supabase
    const dbLiveTrip = fetchedTrips.find((t) => t.isLive);
    if (dbLiveTrip && dbLiveTrip.id !== currentLiveTripId) {
      currentLiveTripId = dbLiveTrip.id;
    }

    // Ensure strictly one live trip matches currentLiveTripId
    fetchedTrips.forEach((t) => {
      t.isLive = t.id === currentLiveTripId;
    });

    // Update memory cache
    memoryTrips = fetchedTrips;
    persistMemory();

    return fetchedTrips;
  } catch (err) {
    console.error('❌ Exception in getTrips:', err);
    memoryTrips.forEach((t) => {
      t.isLive = t.id === currentLiveTripId;
    });
    return memoryTrips;
  }
}

export async function getTripById(id: string): Promise<Trip | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const trip = memoryTrips.find((t) => t.id === id || t.slug === id) || null;
    if (trip) {
      trip.isLive = trip.id === currentLiveTripId;
    }
    return trip;
  }

  try {
    let { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
    if (!data) {
      // Try lookup by slug
      const { data: slugData } = await supabase.from('trips').select('*').eq('slug', id).maybeSingle();
      data = slugData;
    }
    if (!data) {
      const trip = memoryTrips.find((t) => t.id === id || t.slug === id) || null;
      if (trip) {
        trip.isLive = trip.id === currentLiveTripId;
      }
      return trip;
    }
    const mapped = mapRowToTrip(data);
    mapped.isLive = mapped.id === currentLiveTripId;
    return mapped;
  } catch (err) {
    console.error('❌ Exception in getTripById:', err);
    const trip = memoryTrips.find((t) => t.id === id || t.slug === id) || null;
    if (trip) {
      trip.isLive = trip.id === currentLiveTripId;
    }
    return trip;
  }
}

export async function updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
  // If heroImage is a base64 string, upload to Supabase Storage first
  if (updates.heroImage && typeof updates.heroImage === 'string' && updates.heroImage.startsWith('data:image/')) {
    updates.heroImage = await uploadImageToStorage(updates.heroImage, 'trips');
  }

  if (updates.heroImage) {
    updates.featuredImage = updates.heroImage;
  }

  // If gallery has base64 items, upload them to Supabase Storage
  if (Array.isArray(updates.gallery)) {
    const processedGallery: string[] = [];
    for (const img of updates.gallery) {
      if (typeof img === 'string') {
        if (img.startsWith('data:image/')) {
          const uploadedUrl = await uploadImageToStorage(img, 'trips');
          processedGallery.push(uploadedUrl);
        } else {
          processedGallery.push(img);
        }
      }
    }
    // Make sure hero image is part of gallery if present
    if (updates.heroImage && !processedGallery.includes(updates.heroImage)) {
      processedGallery.unshift(updates.heroImage);
    }
    updates.gallery = processedGallery;
  }

  const existing = await getTripById(id);
  if (!existing) return null;

  const mergedTrip: Trip = {
    ...existing,
    ...updates,
    heroImage: updates.heroImage || (updates.gallery && updates.gallery[0]) || existing.heroImage,
    featuredImage: updates.heroImage || updates.featuredImage || (updates.gallery && updates.gallery[0]) || existing.featuredImage,
    isLive: id === currentLiveTripId,
    updatedAt: new Date().toISOString(),
  };

  // Update memory store
  const idx = memoryTrips.findIndex((t) => t.id === id);
  if (idx !== -1) {
    memoryTrips[idx] = mergedTrip;
  } else {
    memoryTrips.push(mergedTrip);
  }
  persistMemory();

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapTripToRow(mergedTrip);
      const { data, error } = await supabase
        .from('trips')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase updateTrip error:', error.message);
      } else if (data) {
        const updated = mapRowToTrip(data);
        updated.isLive = updated.id === currentLiveTripId;
        return updated;
      }
    } catch (err) {
      console.error('❌ Exception in updateTrip:', err);
    }
  }

  return mergedTrip;
}

export async function setHeroImage(tripId: string, imageUrl: string): Promise<Trip | null> {
  const trip = await getTripById(tripId);
  if (!trip) return null;

  let finalUrl = imageUrl;
  if (imageUrl.startsWith('data:image/')) {
    finalUrl = await uploadImageToStorage(imageUrl, 'trips');
  }

  const existingGallery = Array.isArray(trip.gallery) ? [...trip.gallery] : [];
  if (!existingGallery.includes(finalUrl)) {
    existingGallery.unshift(finalUrl);
  }

  return updateTrip(tripId, {
    heroImage: finalUrl,
    featuredImage: finalUrl,
    gallery: existingGallery,
  });
}

export async function updateTripStatus(id: string, status: Trip['status']): Promise<Trip | null> {
  const isLive = status === 'published';
  return updateTrip(id, { status, isLive: isLive });
}

export async function deleteTrip(id: string): Promise<boolean> {
  // Update memory
  const idx = memoryTrips.findIndex((t) => t.id === id);
  if (idx !== -1) {
    memoryTrips.splice(idx, 1);
  }

  // Handle live trip deletion fallback
  if (currentLiveTripId === id) {
    const nextLive = memoryTrips.find((t) => t.status === 'published') || memoryTrips[0] || null;
    currentLiveTripId = nextLive ? nextLive.id : '';
    if (nextLive) {
      nextLive.isLive = true;
    }
  }

  persistMemory();

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) {
        console.error('❌ Supabase deleteTrip error:', error.message);
      }
      if (currentLiveTripId) {
        await supabase.from('trips').update({ is_live: true }).eq('id', currentLiveTripId);
      }
    } catch (e: any) {
      console.error('❌ Exception in deleteTrip:', e.message);
      return false;
    }
  }
  return true;
}

export async function duplicateTrip(sourceId: string): Promise<Trip | null> {
  const source = await getTripById(sourceId);
  if (!source) return null;

  const timestamp = Date.now().toString().slice(-4);
  const newId = `${source.id}-drop-${timestamp}`;
  const newSlug = `${source.slug || source.id}-drop-${timestamp}`;
  const newTitle = `${source.title} — DROP ${timestamp}`;

  const duplicatedData: Partial<Trip> = {
    ...source,
    id: newId,
    slug: newSlug,
    title: newTitle,
    status: 'draft',
    isLive: false,
    bookedSeats: 0,
    availableSeats: source.totalSeats || 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return createTrip(duplicatedData);
}

export async function addTripGalleryImage(tripId: string, imageUrl: string, makeHero: boolean = false): Promise<Trip | null> {
  // 1. Upload to Supabase Storage if base64
  const permanentUrl = await uploadImageToStorage(imageUrl, 'trips');

  const trip = await getTripById(tripId);
  if (!trip) return null;

  const updatedGallery = [permanentUrl, ...(trip.gallery || []).filter((u) => u !== permanentUrl)];
  const updates: Partial<Trip> = { gallery: updatedGallery };
  if (makeHero) {
    updates.heroImage = permanentUrl;
    updates.featuredImage = permanentUrl;
  }

  return updateTrip(tripId, updates);
}

export async function createTrip(tripData: Partial<Trip>): Promise<Trip> {
  const id = tripData.id || (tripData.title ? tripData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `trip-${Date.now()}`);
  const slug = tripData.slug || id;

  let heroImage = tripData.heroImage || tripData.featuredImage || '';
  if (heroImage && heroImage.startsWith('data:image/')) {
    heroImage = await uploadImageToStorage(heroImage, 'trips');
  }

  const gallery: string[] = [];
  if (Array.isArray(tripData.gallery)) {
    for (const img of tripData.gallery) {
      if (typeof img === 'string') {
        if (img.startsWith('data:image/')) {
          const uploaded = await uploadImageToStorage(img, 'trips');
          gallery.push(uploaded);
        } else {
          gallery.push(img);
        }
      }
    }
  }
  if (!gallery.includes(heroImage) && heroImage) {
    gallery.unshift(heroImage);
  }

  const totalSeats = Number(tripData.totalSeats) || 16;
  const bookedSeats = Number(tripData.bookedSeats) || 0;
  const availableSeats = tripData.availableSeats !== undefined ? Number(tripData.availableSeats) : totalSeats - bookedSeats;

  const newTrip: Trip = {
    id,
    slug,
    title: tripData.title || 'New Limited Drop',
    tagline: tripData.tagline || tripData.shortDescription || 'An unforgettable limited-batch adventure with certified leaders',
    shortDescription: tripData.shortDescription || tripData.tagline || 'An unforgettable limited-batch adventure with certified leaders',
    longDescription: tripData.longDescription || tripData.tagline || '',
    location: tripData.location || tripData.destination || 'Himalayas, India',
    destination: tripData.destination || tripData.location || 'Himalayas, India',
    category: tripData.category || 'Mountain Escapes',
    tags: Array.isArray(tripData.tags) && tripData.tags.length > 0 ? tripData.tags : ['Adventure', 'Limited Drop'],
    experienceRatings: tripData.experienceRatings || { adventure: 4, nature: 4, photography: 4, social: 4 },
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    duration: tripData.duration || '4 Days / 3 Nights',
    difficulty: tripData.difficulty || 'Moderate',
    price: Number(tripData.price) || 6999,
    originalPrice: tripData.originalPrice ? Number(tripData.originalPrice) : (Number(tripData.price) || 6999) + 3000,
    totalSeats,
    bookedSeats,
    availableSeats,
    bookingDeadline: tripData.bookingDeadline,
    status: tripData.status || (tripData.isLive ? 'published' : 'draft'),
    heroImage,
    featuredImage: heroImage,
    gallery,
    departureCities: Array.isArray(tripData.departureCities) && tripData.departureCities.length > 0
      ? tripData.departureCities
      : [
          { city: 'Base City (Direct Pickup)', price: Number(tripData.price) || 6999, note: 'Direct station/airport pickup' },
          { city: 'Delhi / NCR', price: (Number(tripData.price) || 6999) + 1500, note: 'AC Coach Transfer included', isPopular: true },
        ],
    itinerary: Array.isArray(tripData.itinerary) && tripData.itinerary.length > 0
      ? tripData.itinerary
      : [
          {
            day: 1,
            title: 'Arrival & Base Orientation',
            description: 'Arrive at the destination, meet RoamX captains, complete briefing, and enjoy evening campfire with regional dinner.',
            meals: { breakfast: false, lunch: false, dinner: true },
            stay: 'Boutique Stay / Alpine Camp',
            altitude: 'Base Altitude',
            highlights: ['Arrival Briefing', 'Campfire Evening'],
          },
        ],
    highlights: Array.isArray(tripData.highlights) && tripData.highlights.length > 0
      ? tripData.highlights
      : ['Certified RoamX Trip Captains', 'Authentic regional meals included', 'Curated small-group experience', 'Evening bonfire & community vibes'],
    inclusions: Array.isArray(tripData.inclusions) && tripData.inclusions.length > 0
      ? tripData.inclusions
      : ['Comfortable twin/triple sharing accommodation', 'All wholesome breakfasts and dinners', 'All sightseeing & inter-city AC transport', 'First aid & emergency support'],
    included: Array.isArray(tripData.included) && tripData.included.length > 0
      ? tripData.included
      : (Array.isArray(tripData.inclusions) && tripData.inclusions.length > 0 ? tripData.inclusions : ['Comfortable stay', 'Breakfast & dinner', 'AC transport', 'Certified trip captain']),
    exclusions: Array.isArray(tripData.exclusions) && tripData.exclusions.length > 0
      ? tripData.exclusions
      : ['Lunches and personal cafe exploration', 'Personal shopping and souvenirs'],
    excluded: Array.isArray(tripData.excluded) && tripData.excluded.length > 0
      ? tripData.excluded
      : (Array.isArray(tripData.exclusions) && tripData.exclusions.length > 0 ? tripData.exclusions : ['Lunches and cafe shopping', 'Personal expenses']),
    thingsToCarry: Array.isArray(tripData.thingsToCarry) && tripData.thingsToCarry.length > 0
      ? tripData.thingsToCarry
      : [
          {
            category: 'Clothing & Footwear',
            items: ['Comfortable walking shoes with good grip', 'Warm layers / windcheater', 'Breathable cotton t-shirts'],
          },
          {
            category: 'Gear & Essentials',
            items: ['Power bank and charging cables', 'UV sunglasses & sunscreen', 'Personal water bottle and ID proof'],
          },
        ],
    packingList: Array.isArray(tripData.packingList) ? tripData.packingList : (Array.isArray(tripData.thingsToCarry) ? tripData.thingsToCarry : []),
    accommodation: tripData.accommodation || 'Boutique Hotel / Luxury Tents',
    transport: tripData.transport || 'AC Tempo Traveler / Innova',
    activities: Array.isArray(tripData.activities) ? tripData.activities : ['Local exploration', 'Cultural walk', 'Bonfire evening'],
    pickupPoint: tripData.pickupPoint || 'Central Hub / Railway Station',
    dropPoint: tripData.dropPoint || 'Central Hub / Railway Station',
    tripLeader: tripData.tripLeader || 'Certified RoamX Expedition Lead',
    batches: Array.isArray(tripData.batches) && tripData.batches.length > 0
      ? tripData.batches
      : [
          { month: 'Upcoming Limited Drop', dates: ['Weekend Special Batch'], status: 'Available' },
        ],
    faqs: Array.isArray(tripData.faqs) && tripData.faqs.length > 0
      ? tripData.faqs
      : [
          { question: 'Who is eligible to join this trip?', answer: 'Youth limited-drop expeditions are strictly curated for travelers aged 18 to 35 years.' },
          { question: 'What is the group size?', answer: 'We maintain small, intimate batches of 12 to 18 travelers for maximum bonding and premium experience.' },
        ],
    importantInformation: Array.isArray(tripData.importantInformation) ? tripData.importantInformation : [],
    safetyInformation: Array.isArray(tripData.safetyInformation) ? tripData.safetyInformation : [],
    cancellationPolicy: tripData.cancellationPolicy || '100% refund on cancellations made 15+ days before departure.',
    ageLimit: tripData.ageLimit || '18 to 35 Years',
    maxAltitude: tripData.maxAltitude || 'Moderate Elevation',
    groupSize: tripData.groupSize || '12 - 16 Travelers per batch',
    bestSeason: tripData.bestSeason || 'All Year Round',
    rating: Number(tripData.rating) || 4.9,
    reviewsCount: Number(tripData.reviewsCount) || 15,
    isFeatured: Boolean(tripData.isFeatured),
    isLive: Boolean(tripData.isLive),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapTripToRow(newTrip);
      await supabase.from('trips').upsert([row], { onConflict: 'id' });
    } catch (e: any) {
      console.error('❌ Failed to insert trip to Supabase:', e.message);
    }
  }

  // Update memory store
  const existingIdx = memoryTrips.findIndex((t) => t.id === newTrip.id);
  if (existingIdx >= 0) {
    memoryTrips[existingIdx] = newTrip;
  } else {
    memoryTrips.push(newTrip);
  }
  persistMemory();

  if (newTrip.isLive) {
    await setLiveTrip(newTrip.id);
  }

  return newTrip;
}

export async function setLiveTrip(tripId: string): Promise<{ success: boolean; trips: Trip[]; liveTrip: Trip | null; liveTripId: string }> {
  currentLiveTripId = tripId;

  // Update memory
  memoryTrips.forEach((t) => {
    t.isLive = t.id === tripId;
  });
  persistMemory();

  const supabase = getSupabase();
  if (supabase) {
    try {
      // Set is_live = false on all other trips
      await supabase.from('trips').update({ is_live: false }).neq('id', tripId);
      // Set is_live = true on target trip
      await supabase.from('trips').update({ is_live: true }).eq('id', tripId);
    } catch (err: any) {
      console.error('❌ Supabase setLiveTrip error:', err.message);
    }
  }

  const all = await getTrips();
  const liveTrip = all.find((t) => t.id === tripId) || null;
  return { success: true, trips: all, liveTrip, liveTripId: tripId };
}

export async function deleteTripGalleryImageByUrl(tripId: string, imageUrl: string): Promise<{ trip: Trip | null; removedUrl?: string }> {
  const trip = await getTripById(tripId);
  if (!trip || !trip.gallery) {
    return { trip: null };
  }

  const updatedGallery = trip.gallery.filter((img) => img !== imageUrl);
  let newHero = trip.heroImage;
  if (trip.heroImage === imageUrl || trip.featuredImage === imageUrl) {
    newHero = updatedGallery[0] || '';
  }

  // Delete from storage
  if (imageUrl) {
    await deleteImageFromStorage(imageUrl);
  }

  const updatedTrip = await updateTrip(tripId, {
    gallery: updatedGallery,
    heroImage: newHero,
    featuredImage: newHero,
  });
  return { trip: updatedTrip, removedUrl: imageUrl };
}

export async function deleteTripGalleryImage(tripId: string, imageIndex: number): Promise<{ trip: Trip | null; removedUrl?: string }> {
  const trip = await getTripById(tripId);
  if (!trip || !trip.gallery || trip.gallery[imageIndex] === undefined) {
    return { trip: null };
  }

  const removedUrl = trip.gallery[imageIndex];
  return deleteTripGalleryImageByUrl(tripId, removedUrl);
}

// =========================================================================
// 2. REVIEWS SERVICE
// =========================================================================

export async function getReviews(tripId?: string): Promise<Review[]> {
  const supabase = getSupabase();
  if (!supabase) {
    if (tripId) return memoryReviews.filter((r) => r.tripId === tripId);
    return memoryReviews;
  }

  try {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (tripId) {
      query = query.eq('trip_id', tripId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase getReviews error:', error.message);
      return memoryReviews;
    }

    if (!data || data.length === 0) {
      if (!isReviewsSeeded) {
        console.log('🌱 Seeding initial reviews into Supabase...');
        isReviewsSeeded = true;
        const seedRows = mockReviews.map(mapReviewToRow);
        const { error: seedError } = await supabase.from('reviews').upsert(seedRows, { onConflict: 'id' });
        if (seedError) console.error('❌ Failed to seed reviews:', seedError.message);
        return mockReviews;
      }
      return [];
    }

    return data.map(mapRowToReview);
  } catch (err) {
    console.error('❌ Exception in getReviews:', err);
    return memoryReviews;
  }
}

export async function createReview(reviewInput: Partial<Review>): Promise<Review> {
  // Process and upload user images to Supabase Storage
  const permanentImages: string[] = [];
  if (Array.isArray(reviewInput.images)) {
    for (const img of reviewInput.images) {
      if (typeof img === 'string') {
        const uploaded = await uploadImageToStorage(img, 'reviews');
        permanentImages.push(uploaded);
      }
    }
  }

  // Process avatar if provided as base64
  let permanentAvatar = reviewInput.avatar;
  if (permanentAvatar && isBase64DataUrl(permanentAvatar)) {
    permanentAvatar = await uploadImageToStorage(permanentAvatar, 'avatars');
  }

  const review: Review = {
    id: reviewInput.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: (reviewInput.name || 'Anonymous Trekker').trim(),
    city: (reviewInput.city || 'India').trim(),
    rating: Math.min(5, Math.max(1, Number(reviewInput.rating) || 5)),
    date: reviewInput.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    title: reviewInput.title?.trim() || undefined,
    comment: (reviewInput.comment || '').trim(),
    images: permanentImages,
    avatar: permanentAvatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80`,
    tripId: reviewInput.tripId || 'kedarkantha-trek',
    tripName: reviewInput.tripName || 'Kedarkantha Winter Snow Trek',
    isVerified: true,
  };

  const supabase = getSupabase();
  if (!supabase) {
    memoryReviews.unshift(review);
    return review;
  }

  try {
    const row = mapReviewToRow(review);
    const { data, error } = await supabase.from('reviews').insert([row]).select().single();

    if (error) {
      console.error('❌ Supabase createReview error:', error.message);
      memoryReviews.unshift(review);
      return review;
    }

    return mapRowToReview(data);
  } catch (err) {
    console.error('❌ Exception in createReview:', err);
    memoryReviews.unshift(review);
    return review;
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    const initLen = memoryReviews.length;
    memoryReviews = memoryReviews.filter((r) => r.id !== id);
    return memoryReviews.length < initLen;
  }

  try {
    // First get review to clean up images
    const { data: revData } = await supabase.from('reviews').select('images').eq('id', id).single();
    if (revData && Array.isArray(revData.images)) {
      for (const imgUrl of revData.images) {
        await deleteImageFromStorage(imgUrl);
      }
    }

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      console.error('❌ Supabase deleteReview error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('❌ Exception in deleteReview:', err);
    return false;
  }
}

export async function deleteReviewImage(reviewId: string, imageIndex: number): Promise<Review | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const rev = memoryReviews.find((r) => r.id === reviewId);
    if (!rev || !rev.images || rev.images[imageIndex] === undefined) return null;
    rev.images.splice(imageIndex, 1);
    return rev;
  }

  try {
    const { data, error } = await supabase.from('reviews').select('*').eq('id', reviewId).single();
    if (error || !data) return null;

    const currentReview = mapRowToReview(data);
    if (!currentReview.images || currentReview.images[imageIndex] === undefined) return null;

    const removedUrl = currentReview.images[imageIndex];
    const updatedImages = currentReview.images.filter((_, idx) => idx !== imageIndex);

    if (removedUrl) {
      await deleteImageFromStorage(removedUrl);
    }

    const { data: updatedData, error: updateError } = await supabase
      .from('reviews')
      .update({ images: updatedImages })
      .eq('id', reviewId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Supabase deleteReviewImage error:', updateError.message);
      return null;
    }

    return mapRowToReview(updatedData);
  } catch (err) {
    console.error('❌ Exception in deleteReviewImage:', err);
    return null;
  }
}

// =========================================================================
// 3. INQUIRIES & BOOKINGS SERVICE
// =========================================================================

export async function getInquiries(): Promise<BookingInquiry[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return memoryInquiries;
  }

  try {
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase getInquiries error:', error.message);
      return memoryInquiries;
    }

    return (data || []).map(mapRowToInquiry);
  } catch (err) {
    console.error('❌ Exception in getInquiries:', err);
    return memoryInquiries;
  }
}

export async function createInquiry(inquiryData: Partial<BookingInquiry>): Promise<BookingInquiry> {
  const inquiry: BookingInquiry = {
    id: inquiryData.id || `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tripBookingId: inquiryData.tripBookingId || `RX-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
    tripId: inquiryData.tripId || 'kedarkantha-trek',
    tripTitle: inquiryData.tripTitle || 'Kedarkantha Winter Snow Trek',
    name: inquiryData.name || '',
    phone: inquiryData.phone || '',
    email: inquiryData.email || '',
    dateOfBirth: inquiryData.dateOfBirth || '',
    age: inquiryData.age,
    gender: inquiryData.gender || 'Male',
    travelersCount: 1, // Single trekker per transaction
    departureCity: inquiryData.departureCity || 'Dehradun',
    selectedMonth: inquiryData.selectedMonth || '',
    selectedDate: inquiryData.selectedDate || '',
    calculatedPrice: Number(inquiryData.calculatedPrice) || 8499,
    paidAmount: Number(inquiryData.paidAmount) || 0,
    paymentStatus: inquiryData.paymentStatus || 'Unpaid',
    utrNumber: inquiryData.utrNumber || '',
    paymentMethod: inquiryData.paymentMethod || '',
    razorpayPaymentId: inquiryData.razorpayPaymentId || '',
    razorpayOrderId: inquiryData.razorpayOrderId || '',
    razorpaySignature: inquiryData.razorpaySignature || '',
    message: inquiryData.message || '',
    status: inquiryData.status || 'New',
    createdAt: inquiryData.createdAt || new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (!supabase) {
    memoryInquiries.unshift(inquiry);
    persistMemory();
    return inquiry;
  }

  try {
    const row = mapInquiryToRow(inquiry);
    const { data, error } = await supabase.from('inquiries').insert([row]).select().single();

    if (error) {
      console.error('❌ Supabase createInquiry error:', error.message);
      memoryInquiries.unshift(inquiry);
      persistMemory();
      return inquiry;
    }

    return mapRowToInquiry(data);
  } catch (err) {
    console.error('❌ Exception in createInquiry:', err);
    memoryInquiries.unshift(inquiry);
    persistMemory();
    return inquiry;
  }
}

export async function findInquiryByRazorpayPaymentId(paymentId: string): Promise<BookingInquiry | null> {
  if (!paymentId) return null;

  // 1. Check in-memory store first
  const memFound = memoryInquiries.find(
    (i) => i.razorpayPaymentId === paymentId || i.utrNumber === paymentId
  );
  if (memFound) return memFound;

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('utr_number', paymentId)
      .maybeSingle();

    if (error) {
      console.warn('⚠️ Supabase findInquiryByRazorpayPaymentId notice:', error.message);
      return null;
    }

    return data ? mapRowToInquiry(data) : null;
  } catch (err) {
    console.error('❌ Exception in findInquiryByRazorpayPaymentId:', err);
    return null;
  }
}

export async function saveRazorpayBooking(inquiryData: Partial<BookingInquiry>): Promise<BookingInquiry> {
  const verifiedBooking: Partial<BookingInquiry> = {
    ...inquiryData,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Razorpay',
  };

  // 1. Create or save booking inquiry
  const saved = await createInquiry(verifiedBooking);

  // 2. Increment booked seats on the associated trip if possible
  if (saved.tripId) {
    try {
      const trip = await getTripById(saved.tripId);
      if (trip) {
        const currentBooked = trip.bookedSeats || 0;
        const total = trip.totalSeats || 16;
        const newBooked = currentBooked + (saved.travelersCount || 1);
        const newAvailable = Math.max(0, total - newBooked);
        await updateTrip(saved.tripId, {
          bookedSeats: newBooked,
          availableSeats: newAvailable,
        });
      }
    } catch (tripErr) {
      console.warn('⚠️ Could not auto-increment booked seats for trip:', tripErr);
    }
  }

  return saved;
}

export async function verifyAndSaveUtrInquiry(inquiryData: Partial<BookingInquiry>): Promise<BookingInquiry> {
  const verifiedInquiry: Partial<BookingInquiry> = {
    ...inquiryData,
    status: 'Confirmed',
    paymentStatus: 'Verified',
    paidAmount: 500,
    paymentMethod: 'UPI QR Verified',
  };

  return createInquiry(verifiedInquiry);
}

export async function updateInquiryStatus(
  id: string,
  status: BookingInquiry['status'],
  paymentStatus?: BookingInquiry['paymentStatus']
): Promise<BookingInquiry | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const inq = memoryInquiries.find((i) => i.id === id);
    if (!inq) return null;
    inq.status = status;
    if (paymentStatus) inq.paymentStatus = paymentStatus;
    return inq;
  }

  try {
    const updatePayload: any = { status };
    if (paymentStatus) updatePayload.payment_status = paymentStatus;

    const { data, error } = await supabase
      .from('inquiries')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase updateInquiryStatus error:', error.message);
      return null;
    }

    return mapRowToInquiry(data);
  } catch (err) {
    console.error('❌ Exception in updateInquiryStatus:', err);
    return null;
  }
}

// =========================================================================
// 4. ANNOUNCEMENTS SERVICE
// =========================================================================

export async function getAnnouncements(): Promise<AnnouncementStrip[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return memoryAnnouncements;
  }

  try {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase getAnnouncements error:', error.message);
      return memoryAnnouncements;
    }

    if (!data || data.length === 0) {
      if (!isAnnouncementsSeeded) {
        console.log('🌱 Seeding initial announcements into Supabase...');
        isAnnouncementsSeeded = true;
        const seedRows = initialAnnouncements.map(mapAnnouncementToRow);
        const { error: seedError } = await supabase.from('announcements').upsert(seedRows, { onConflict: 'id' });
        if (seedError) console.error('❌ Failed to seed announcements:', seedError.message);
        return initialAnnouncements;
      }
      return [];
    }

    return data.map(mapRowToAnnouncement);
  } catch (err) {
    console.error('❌ Exception in getAnnouncements:', err);
    return memoryAnnouncements;
  }
}

export async function getActiveAnnouncement(): Promise<AnnouncementStrip | null> {
  const all = await getAnnouncements();
  return all.find((a) => a.isActive) || null;
}

export async function createAnnouncement(annData: Partial<AnnouncementStrip>): Promise<AnnouncementStrip> {
  const newAnn: AnnouncementStrip = {
    id: annData.id || `ann-${Date.now()}`,
    text: (annData.text || '').trim(),
    link: annData.link || '#booking-section',
    badge: annData.badge || 'OFFER',
    isActive: Boolean(annData.isActive),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (!supabase) {
    if (newAnn.isActive) {
      memoryAnnouncements.forEach((a) => (a.isActive = false));
    }
    memoryAnnouncements.unshift(newAnn);
    return newAnn;
  }

  try {
    // If activating new banner, deactivate all other banners
    if (newAnn.isActive) {
      await supabase.from('announcements').update({ is_active: false }).neq('id', 'temp-none');
    }

    const row = mapAnnouncementToRow(newAnn);
    const { data, error } = await supabase.from('announcements').insert([row]).select().single();

    if (error) {
      console.error('❌ Supabase createAnnouncement error:', error.message);
      memoryAnnouncements.unshift(newAnn);
      return newAnn;
    }

    return mapRowToAnnouncement(data);
  } catch (err) {
    console.error('❌ Exception in createAnnouncement:', err);
    memoryAnnouncements.unshift(newAnn);
    return newAnn;
  }
}

export async function toggleAnnouncementActive(id: string): Promise<{ all: AnnouncementStrip[]; active: AnnouncementStrip | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    memoryAnnouncements.forEach((a) => {
      a.isActive = a.id === id ? !a.isActive : false;
    });
    const active = memoryAnnouncements.find((a) => a.isActive) || null;
    return { all: memoryAnnouncements, active };
  }

  try {
    // 1. Check current state
    const { data: current } = await supabase.from('announcements').select('is_active').eq('id', id).single();
    const willBeActive = !current?.is_active;

    // 2. Set all to inactive
    await supabase.from('announcements').update({ is_active: false }).neq('id', 'temp-none');

    // 3. If toggled on, activate target
    if (willBeActive) {
      await supabase.from('announcements').update({ is_active: true }).eq('id', id);
    }

    const all = await getAnnouncements();
    const active = all.find((a) => a.isActive) || null;
    return { all, active };
  } catch (err) {
    console.error('❌ Exception in toggleAnnouncementActive:', err);
    const all = await getAnnouncements();
    return { all, active: null };
  }
}

export async function deleteAnnouncement(id: string): Promise<AnnouncementStrip[]> {
  const supabase = getSupabase();
  if (!supabase) {
    memoryAnnouncements = memoryAnnouncements.filter((a) => a.id !== id);
    return memoryAnnouncements;
  }

  try {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) console.error('❌ Supabase deleteAnnouncement error:', error.message);
    return getAnnouncements();
  } catch (err) {
    console.error('❌ Exception in deleteAnnouncement:', err);
    return getAnnouncements();
  }
}
