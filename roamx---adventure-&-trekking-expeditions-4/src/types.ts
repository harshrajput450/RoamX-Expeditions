export interface DepartureCity {
  city: string;
  price: number;
  note?: string;
  isPopular?: boolean;
}

export interface MealPlan {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  subtitle?: string;
  description: string;
  altitude?: string;
  distance?: string;
  trekDuration?: string;
  meals: MealPlan;
  stay: string;
  highlights: string[];
}

export interface BatchDate {
  month: string;
  dates: string[];
  status: 'Available' | 'Filling Fast' | 'Sold Out';
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Review {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  title?: string;
  comment: string;
  avatar?: string;
  images?: string[];
  tripId?: string;
  tripName: string;
  isVerified?: boolean;
}

export interface Trip {
  id: string;
  title: string;
  slug?: string;
  tagline: string;
  shortDescription?: string;
  longDescription?: string;
  location: string;
  destination?: string;
  category?: 'Mountain Escapes' | 'Culture & Heritage' | 'Spiritual Journeys' | 'Hidden Escapes' | string;
  tags?: string[];
  experienceRatings?: {
    culture?: number;
    heritage?: number;
    photography?: number;
    food?: number;
    spiritual?: number;
    adventure?: number;
    nature?: number;
    mountains?: number;
    cafes?: number;
    social?: number;
    chill?: number;
    [key: string]: number | undefined;
  };
  startDate?: string;
  endDate?: string;
  duration: string;
  difficulty: 'Easy' | 'Easy to Moderate' | 'Moderate' | 'Moderate to Difficult' | 'Difficult';
  price: number;
  originalPrice?: number;
  totalSeats?: number;
  bookedSeats?: number;
  availableSeats?: number;
  bookingDeadline?: string;
  status?: 'draft' | 'published' | 'sold-out' | 'completed' | 'cancelled';
  heroImage: string;
  featuredImage?: string;
  gallery: string[];
  departureCities: DepartureCity[];
  itinerary: ItineraryDay[];
  highlights: string[];
  inclusions: string[];
  included?: string[];
  exclusions: string[];
  excluded?: string[];
  thingsToCarry: {
    category: string;
    items: string[];
  }[];
  packingList?: {
    category: string;
    items: string[];
  }[];
  accommodation?: string;
  transport?: string;
  activities?: string[];
  pickupPoint?: string;
  dropPoint?: string;
  tripLeader?: string;
  batches: BatchDate[];
  faqs: FAQ[];
  importantInformation?: string[];
  safetyInformation?: string[];
  cancellationPolicy?: string;
  ageLimit: string;
  maxAltitude: string;
  groupSize: string;
  bestSeason: string;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  is_featured?: boolean;
  isLive?: boolean;
  is_live?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementStrip {
  id: string;
  text: string;
  link: string;
  badge?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BookingInquiry {
  id: string;
  tripBookingId?: string; // Unique Trip ID (e.g. ROAMX-KED-84920)
  tripId: string;
  tripTitle: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  age?: number; // Must be between 18 and 35
  gender?: 'Male' | 'Female';
  travelersCount: number;
  departureCity: string;
  selectedMonth?: string;
  selectedDate?: string;
  calculatedPrice: number;
  paidAmount?: number; // e.g. 500
  paymentStatus?: 'Unpaid' | 'Paid (₹500)' | 'Paid' | 'Verified' | 'Pending Verification' | 'Failed';
  utrNumber?: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  message?: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Archived';
  createdAt: string;
}
