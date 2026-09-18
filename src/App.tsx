import React, { useState, useEffect } from 'react';
import { AnnouncementStrip, BookingInquiry, DepartureCity, Trip } from './types';
import { TopAnnouncementStrip } from './components/TopAnnouncementStrip';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TripHighlightsGrid } from './components/TripHighlightsGrid';
import { DepartureCitiesSelector } from './components/DepartureCitiesSelector';
import { VerticalItineraryTimeline } from './components/VerticalItineraryTimeline';
import { GallerySection } from './components/GallerySection';
import { InclusionsExclusions } from './components/InclusionsExclusions';
import { ThingsToCarry } from './components/ThingsToCarry';
import { OtherTripsSection } from './components/OtherTripsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal, OWNER_EMAIL } from './components/AdminLoginModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AIChatModal } from './components/AIChatModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { WhatsAppIcon } from './components/WhatsAppIcon';
import { MobileStickyBookingBar } from './components/MobileStickyBookingBar';
import { BookingLogo } from './components/BookingLogo';
import { Logo } from './components/Logo';
import { Mountain, Phone, Mail, MapPin, Heart, ShieldCheck, Compass, Sparkles, Lock, Key, LogOut, MessageSquare, Globe } from 'lucide-react';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [announcements, setAnnouncements] = useState<AnnouncementStrip[]>([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementStrip | null>(null);
  const [isTripsLoading, setIsTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);

  // Derive Hero trip dynamically: check for is_featured === true, or fallback to live/first trip
  const featuredTrip = trips.find(
    (t: any) => t.is_featured === true || t.isFeatured === true
  );
  const defaultHeroTrip =
    featuredTrip ||
    trips.find((t) => t.isLive) ||
    trips.find((t) => t.status === 'published') ||
    trips[0];

  const activeTrip =
    trips.find((t) => t.id === activeTripId) || defaultHeroTrip;
  const [selectedCity, setSelectedCity] = useState<DepartureCity>(
    activeTrip?.departureCities[0] || { city: '', price: 0 }
  );
  const [selectedBatchDate, setSelectedBatchDate] = useState<string>(
    activeTrip?.batches[0]?.dates[0] || ''
  );

  // Inquiries State
  const [inquiries, setInquiries] = useState<BookingInquiry[]>([]);
  const [lastSubmittedInquiry, setLastSubmittedInquiry] = useState<BookingInquiry | null>(null);

  // Admin Authentication & Session
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('roamx_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('roamx_admin_email') || OWNER_EMAIL;
    } catch {
      return OWNER_EMAIL;
    }
  });

  // Modals & Widgets
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Admin Open Gatekeeper
  const handleOpenAdminTrigger = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (email: string) => {
    setIsAdminAuthenticated(true);
    setAdminEmail(email);
    setIsLoginModalOpen(false);
    setIsAdminOpen(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('roamx_admin_auth');
    localStorage.removeItem('roamx_admin_email');
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  // Keyboard shortcut (Ctrl + Shift + A) and URL param detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleOpenAdminTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Check ?admin=true in URL
    if (typeof window !== 'undefined' && window.location.search.includes('admin=true')) {
      handleOpenAdminTrigger();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminAuthenticated]);

  // Reset selected city and batch when active trip changes
  useEffect(() => {
    if (activeTrip && activeTrip.departureCities.length > 0) {
      setSelectedCity(activeTrip.departureCities[0]);
    }
    if (activeTrip && activeTrip.batches.length > 0 && activeTrip.batches[0].dates.length > 0) {
      setSelectedBatchDate(activeTrip.batches[0].dates[0]);
    }
  }, [activeTripId]);

  // Fetch initial data from Express API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeAnnRes, allAnnRes, tripsRes, inqRes, settingsRes] = await Promise.all([
          fetch('/api/announcements/active').catch(() => null),
          fetch('/api/announcements').catch(() => null),
          fetch('/api/trips').catch(() => null),
          fetch('/api/inquiries').catch(() => null),
          fetch('/api/homepage-settings').catch(() => null),
        ]);

        if (activeAnnRes && activeAnnRes.ok) {
          const json = await activeAnnRes.json();
          if (json.success) setActiveAnnouncement(json.data);
        }
        if (allAnnRes && allAnnRes.ok) {
          const json = await allAnnRes.json();
          if (json.success) setAnnouncements(json.data);
        }
        if (tripsRes && tripsRes.ok) {
          const json = await tripsRes.json();
          if (json.success && Array.isArray(json.data)) {
            setTrips(json.data);
            // Prioritize Supabase is_featured trip for Hero section
            const featured = json.data.find(
              (t: any) => t.is_featured === true || t.isFeatured === true
            );
            const fallbackHero =
              featured ||
              json.data.find((t: Trip) => t.isLive) ||
              json.data.find((t: Trip) => t.status === 'published') ||
              json.data[0];

            if (fallbackHero) {
              setActiveTripId(fallbackHero.id);
            }
          } else {
            setTripsError(json.error || 'Unable to load trips.');
          }
        } else {
          setTripsError('Unable to load trips from the API.');
        }
        if (settingsRes && settingsRes.ok) {
          const sJson = await settingsRes.json();
          if (sJson.success && sJson.liveTripId) {
            setActiveTripId(sJson.liveTripId);
          }
        }
        if (inqRes && inqRes.ok) {
          const json = await inqRes.json();
          if (json.success) setInquiries(json.data);
        }
      } catch (err) {
        console.warn('API sync fallback to local store:', err);
        setTripsError('Unable to load trips from the API.');
      } finally {
        setIsTripsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Admin Action: Toggle Active Banner (Enforces SINGLE active banner guarantee)
  const handleToggleActiveBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.all);
        setActiveAnnouncement(data.active || null);
      }
    } catch (err) {
      console.error('Failed to toggle banner on backend:', err);
      // Local fallback
      const updated = announcements.map((a) => ({
        ...a,
        isActive: a.id === id,
      }));
      setAnnouncements(updated);
      setActiveAnnouncement(updated.find((a) => a.id === id) || null);
    }
  };

  // Admin Action: Create New Banner
  const handleCreateBanner = async (newBanner: Partial<AnnouncementStrip>) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.all);
        if (newBanner.isActive) {
          setActiveAnnouncement(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to create banner:', err);
    }
  };

  // Admin Action: Delete Banner
  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data);
        const nextActive = data.data.find((a: AnnouncementStrip) => a.isActive) || null;
        setActiveAnnouncement(nextActive);
      }
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  // Admin Action: Update Trip
  const handleUpdateTrip = async (updatedFields: Partial<Trip>) => {
    try {
      const res = await fetch(`/api/trips/${activeTrip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (data.success) {
        setTrips((prev) =>
          prev.map((t) => (t.id === activeTrip.id ? { ...t, ...data.data } : t))
        );
        if (data.data.departureCities && data.data.departureCities.length > 0) {
          const matchingCity = data.data.departureCities.find((c: DepartureCity) => c.city === selectedCity.city);
          if (matchingCity) {
            setSelectedCity(matchingCity);
          } else {
            setSelectedCity(data.data.departureCities[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update trip:', err);
      // Fallback local update
      setTrips((prev) =>
        prev.map((t) => (t.id === activeTrip.id ? { ...t, ...updatedFields } : t))
      );
    }
  };

  // Admin Action: Set Live / Featured Trip on Homepage
  const handleSetLiveTrip = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/set-live`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success && Array.isArray(data.trips)) {
        setTrips(data.trips);
      } else {
        setTrips((prev) => prev.map((t) => ({ ...t, isLive: t.id === tripId })));
      }
    } catch (err) {
      console.error('Failed to set live trip on backend:', err);
      setTrips((prev) => prev.map((t) => ({ ...t, isLive: t.id === tripId })));
    }
    setActiveTripId(tripId);
  };

  // Admin Action: Set Hero Image
  const handleSetHeroImage = async (tripId: string, imageUrl: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/hero`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, ...data.data } : t)));
      }
    } catch (err) {
      console.error('Failed to set hero image:', err);
    }
  };

  // Admin Action: Create New Expedition
  const handleCreateTrip = (newTrip: Trip) => {
    setTrips((prev) => {
      const exists = prev.some((t) => t.id === newTrip.id);
      return exists ? prev.map((t) => (t.id === newTrip.id ? newTrip : t)) : [newTrip, ...prev];
    });
    setActiveTripId(newTrip.id);
    if (newTrip.departureCities?.[0]) {
      setSelectedCity(newTrip.departureCities[0]);
    }
    if (newTrip.batches?.[0]?.dates?.[0]) {
      setSelectedBatchDate(newTrip.batches[0].dates[0]);
    }
  };

  // Admin Action: Duplicate Expedition
  const handleDuplicateTrip = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setTrips((prev) => [data.data, ...prev]);
        setActiveTripId(data.data.id);
        if (data.data.departureCities?.[0]) {
          setSelectedCity(data.data.departureCities[0]);
        }
      } else {
        throw new Error(data.error || 'Failed to duplicate trip');
      }
    } catch (err) {
      console.error('Failed to duplicate trip:', err);
      throw err;
    }
  };

  // Admin Action: Delete Expedition
  const handleDeleteTrip = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const remainingTrips = trips.filter((t) => t.id !== tripId);
        setTrips(remainingTrips);
        if (remainingTrips.length > 0) {
          const nextActive = remainingTrips.find((t) => t.isLive) || remainingTrips[0];
          setActiveTripId(nextActive.id);
          if (nextActive.departureCities?.[0]) {
            setSelectedCity(nextActive.departureCities[0]);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to delete trip');
      }
    } catch (err) {
      console.error('Failed to delete trip:', err);
      throw err;
    }
  };

  // Admin Action: Delete Gallery Image
  const handleDeleteGalleryImage = async (imageUrl: string, tripId?: string) => {
    const targetTripId = tripId || activeTrip.id;
    try {
      const res = await fetch(`/api/trips/${targetTripId}/gallery`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTrips((prev) => prev.map((t) => (t.id === targetTripId ? { ...t, ...data.data } : t)));
      }
    } catch (err) {
      console.error('Failed to delete gallery image:', err);
    }
  };

  // Admin Action: Upload / Add Image to Gallery or Hero
  const handleUploadImage = async (imageUrl: string, makeHero: boolean) => {
    try {
      const res = await fetch(`/api/trips/${activeTrip.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, makeHero }),
      });
      const data = await res.json();
      if (data.success) {
        setTrips((prev) =>
          prev.map((t) => (t.id === activeTrip.id ? { ...t, ...data.data } : t))
        );
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  };

  // Inquiry Submission Handler
  const handleInquirySubmitted = (inquiry: BookingInquiry) => {
    setInquiries((prev) => [inquiry, ...prev]);
    setLastSubmittedInquiry(inquiry);
  };

  // Inquiry Status Updater
  const handleUpdateInquiryStatus = async (id: string, status: BookingInquiry['status']) => {
    try {
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(data.all);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (isTripsLoading) {
    return <div className="min-h-screen bg-[#F8F9FA]" aria-busy="true" />;
  }

  if (tripsError || !activeTrip) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 text-center text-[#1E293B]">
        <p className="text-sm font-medium">{tripsError || 'No trips available.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1E293B] antialiased selection:bg-[#FF6B35] selection:text-white overflow-x-hidden w-full max-w-full">
      
      {/* 1. Live Sticky Top Announcement Strip (Only show management button to authenticated admin) */}
      <TopAnnouncementStrip
        announcement={activeAnnouncement}
        onOpenAdmin={isAdminAuthenticated ? () => setIsAdminOpen(true) : undefined}
        onDismiss={() => setActiveAnnouncement(null)}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        trips={trips}
        activeTrip={activeTrip}
        onSelectTrip={(id) => setActiveTripId(id)}
        onOpenAdmin={handleOpenAdminTrigger}
        onOpenAIChat={() => setIsAiChatOpen(true)}
        inquiriesCount={inquiries.length}
        isAdminAuthenticated={isAdminAuthenticated}
        adminEmail={adminEmail}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-full overflow-hidden">
        <div className="bg-white">
          {/* 3. Hero Section with overlay & Floating Sidebar Booking Form */}
          <HeroSection
            trip={activeTrip}
            selectedCity={selectedCity}
            onSelectCity={(city) => setSelectedCity(city)}
            selectedBatchDate={selectedBatchDate}
            onInquirySubmitted={handleInquirySubmitted}
            onOpenAIChat={() => setIsAiChatOpen(true)}
            inquiries={inquiries}
          />

          {/* 4. Trip Highlights & Inclusions Grid */}
          <TripHighlightsGrid trip={activeTrip} inquiries={inquiries} />

          {/* 5. Departure Cities & Batch Dates Selector */}
          <DepartureCitiesSelector
            trip={activeTrip}
            selectedCity={selectedCity}
            onSelectCity={(city) => setSelectedCity(city)}
            selectedBatchDate={selectedBatchDate}
            onSelectBatchDate={(date, month) => {
              setSelectedBatchDate(date);
              const el = document.getElementById('booking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 6. Vertical Itinerary Timeline with Day 1..Day N + Meal indicators */}
          <VerticalItineraryTimeline trip={activeTrip} />

          {/* 7. Gallery Grid & Lightbox */}
          <GallerySection trip={activeTrip} />

          {/* 8. Inclusions vs Exclusions Comparison */}
          <InclusionsExclusions trip={activeTrip} />

          {/* 9. Things to Pack & Carry (Interactive Checklist) */}
          <ThingsToCarry trip={activeTrip} />

          {/* 10. Other Expeditions with Price (Placed on homepage above review tab) */}
          <OtherTripsSection
            trips={trips}
            activeTripId={activeTripId}
            onSelectTrip={(id) => setActiveTripId(id)}
            inquiries={inquiries}
          />

          {/* 11. Reviews & FAQ Section with Rating & Review Tabs, Trekker Photos & Review Composer */}
          <ReviewsSection trip={activeTrip} allTrips={trips} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#002D3A] text-white border-t border-[#003d4d] py-12 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Logo size="md" variant="light" />
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                India's top-rated experiential trekking and overland road trip community. Certified leaders, authentic stays, and memories for a lifetime.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-orange-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
                <span>100% Safe & Certified Expeditions</span>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://wa.me/916205054837?text=Hi%20RoamX,%20I%20have%20an%20inquiry%20regarding%20upcoming%20treks."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full transition-all shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3">
                Featured Expeditions
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {trips.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => {
                        setActiveTripId(t.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#FF6B35] transition-colors text-left cursor-pointer"
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Departure Hubs */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3">
                Departure Hubs & Features
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li>• Delhi (Kashmiri Gate / Majnu Ka Tilla)</li>
                <li>• Mumbai & Pune (Airport / Station connects)</li>
                <li>• Dehradun ISBT (Base pickups)</li>
                <li>• Bengaluru & Hyderabad (Flight coordination)</li>
                <li>• Chandigarh & Shimla</li>
              </ul>
              <div className="mt-3">
                <button
                  onClick={() => setIsAiChatOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-cyan-200 border border-cyan-400/30 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Launch Gemini AI Guide</span>
                </button>
              </div>
            </div>

            {/* Col 4: Contact & Dev Hub */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200">
                Contact & Official Booking
              </h4>
              <p className="text-xs text-gray-300">
                Need immediate batch booking assistance or custom group quote?
              </p>
              <div className="space-y-2 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+916205054837"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
                    title="Direct Call Helpline"
                    aria-label="Direct Call Helpline"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FF6B35]" />
                  </a>
                  <a
                    href="https://wa.me/916205054837?text=Hi%20RoamX,%20I%20need%20booking%20assistance."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors border border-emerald-400/30"
                    title="Official WhatsApp Assistance"
                    aria-label="Official WhatsApp Assistance"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                  <span className="text-xs text-gray-300">24x7 Helpline Hotline</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <a
                    href="mailto:expeditions@roamx.com"
                    className="hover:text-white transition-colors"
                  >
                    expeditions@roamx.com
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                {isAdminAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAdminOpen(true)}
                      className="text-[11px] font-bold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-500/40 cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Admin Section</span>
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="text-[11px] font-bold bg-rose-900/30 hover:bg-rose-900/50 text-rose-200 px-2.5 py-1.5 rounded-lg border border-rose-500/30 cursor-pointer transition-colors"
                      title="Log Out Admin"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-[11px] font-semibold bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 cursor-pointer transition-colors flex items-center gap-1.5"
                    title="Restricted access for site owner"
                  >
                    <Lock className="w-3 h-3 text-gray-400" />
                    <span>Staff & Owner Login</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-gray-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
            <p>© {new Date().getFullYear()} RoamX Expeditions Private Limited. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Cancellation & Refund</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Controls: WhatsApp Speed Dial */}
      <WhatsAppButton activeTrip={activeTrip} />

      {/* Gemini AI Expedition Guide Modal */}
      <AIChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        activeTrip={activeTrip}
        onSelectTrip={(tripId) => {
          setActiveTripId(tripId);
          setIsAiChatOpen(false);
        }}
      />

      {/* Admin Login Modal (Restricted access gate) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        announcements={announcements}
        onToggleActiveBanner={handleToggleActiveBanner}
        onCreateBanner={handleCreateBanner}
        onDeleteBanner={handleDeleteBanner}
        activeTrip={activeTrip}
        allTrips={trips}
        onSelectTrip={(id) => {
          setActiveTripId(id);
          const t = trips.find((item) => item.id === id);
          if (t?.departureCities?.[0]) setSelectedCity(t.departureCities[0]);
        }}
        onSetLiveTrip={handleSetLiveTrip}
        onSetHeroImage={handleSetHeroImage}
        onCreateTrip={handleCreateTrip}
        onUpdateTrip={handleUpdateTrip}
        onDeleteTrip={handleDeleteTrip}
        onDuplicateTrip={handleDuplicateTrip}
        onUploadImage={handleUploadImage}
        onDeleteGalleryImage={handleDeleteGalleryImage}
        inquiries={inquiries}
        onUpdateInquiryStatus={handleUpdateInquiryStatus}
        adminEmail={adminEmail}
        onLogout={handleAdminLogout}
      />

      {/* Floating Mobile Sticky 'Book Now' Bar */}
      <MobileStickyBookingBar
        trip={activeTrip}
        selectedCity={selectedCity}
      />

      {/* Booking Confirmation Modal */}
      <ConfirmationModal
        inquiry={lastSubmittedInquiry}
        onClose={() => setLastSubmittedInquiry(null)}
      />

    </div>
  );
}
