import React, { useState, useMemo } from 'react';
import {
  Compass,
  Mountain,
  Calendar,
  MapPin,
  Star,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Trip, BookingInquiry } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BookingLogo } from './BookingLogo';
import { SeatProgressBar } from './SeatProgressBar';

interface OtherTripsSectionProps {
  trips: Trip[];
  activeTripId: string;
  onSelectTrip: (tripId: string) => void;
  inquiries?: BookingInquiry[];
}

const CATEGORIES = [
  { id: 'all', label: 'All Expeditions' },
  { id: 'uttarakhand', label: 'Uttarakhand' },
  { id: 'himachal', label: 'Himachal Pradesh' },
  { id: 'spiritual', label: 'Spiritual & Heritage' },
  { id: 'rajasthan', label: 'Rajasthan Desert' },
  { id: 'weekend', label: 'Weekend Getaways' },
];

export const OtherTripsSection: React.FC<OtherTripsSectionProps> = ({
  trips,
  activeTripId,
  onSelectTrip,
  inquiries = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTrips = useMemo(() => {
    if (selectedCategory === 'all') return trips;
    if (selectedCategory === 'uttarakhand') {
      return trips.filter((t) => t.location.toLowerCase().includes('uttarakhand') || t.location.toLowerCase().includes('garhwal'));
    }
    if (selectedCategory === 'himachal') {
      return trips.filter((t) => t.location.toLowerCase().includes('himachal') || t.location.toLowerCase().includes('spiti') || t.location.toLowerCase().includes('kullu'));
    }
    if (selectedCategory === 'spiritual') {
      return trips.filter(
        (t) =>
          t.id.includes('vrindavan') ||
          t.id.includes('varanasi') ||
          t.id.includes('badrinath') ||
          t.title.toLowerCase().includes('spiritual') ||
          t.title.toLowerCase().includes('yatra')
      );
    }
    if (selectedCategory === 'rajasthan') {
      return trips.filter((t) => t.location.toLowerCase().includes('rajasthan') || t.id.includes('pushkar'));
    }
    if (selectedCategory === 'weekend') {
      return trips.filter((t) => t.duration.includes('2 Days') || t.duration.includes('3 Days'));
    }
    return trips;
  }, [trips, selectedCategory]);

  return (
    <section id="other-trips-section" className="py-16 bg-white border-t border-b border-gray-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6B35] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore All RoamX Expeditions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Himalayan Expeditions, Cultural & Spiritual Tours
            </h2>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              All expeditions include certified mountain leads, premium camping gear, transparent multi-city departure hubs, and instant ₹500 seat reservation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/916205054837?text=Hi%20RoamX%20Team!%20Can%20you%20share%20the%20complete%20schedule%20and%20catalogue%20for%20all%20RoamX%20expeditions?"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full transition-all shadow-2xs"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
              <span>Chat with Us on WhatsApp</span>
            </a>
            <div className="text-xs text-gray-500 font-semibold hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{trips.length} Active Expeditions</span>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none max-w-full">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#004E64] text-white shadow-md shadow-[#004E64]/20'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-full">
          {filteredTrips.map((trip) => {
            const isCurrent = trip.id === activeTripId;

            return (
              <div
                key={trip.id}
                className={`group rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white w-full max-w-full ${
                  isCurrent
                    ? 'border-[#004E64] shadow-xl ring-2 ring-[#004E64]/20'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Trip Card Image & Tags */}
                  <div className="relative aspect-16/10 overflow-hidden bg-gray-100">
                    <img
                      src={trip.heroImage}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF6B35]" />
                        <span>{trip.location}</span>
                      </span>

                      {trip.isLive ? (
                        <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                          <span>LIVE NOW</span>
                        </span>
                      ) : (
                        <span className="bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1">
                          <span>COMING SOON</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Floating Altitude & Rating */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1.5 font-bold drop-shadow-sm">
                        <Mountain className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{trip.maxAltitude}</span>
                      </div>

                      <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{trip.rating}</span>
                        <span className="text-[10px] text-gray-300">({trip.reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-[#FF6B35] uppercase tracking-wider">
                        {trip.duration} Expedition
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#004E64] transition-colors leading-snug">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {trip.tagline}
                      </p>
                    </div>

                    {/* Quick Specs Pill */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Season</span>
                        <strong className="text-gray-800 font-semibold">{trip.bestSeason.split(',')[0]}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Group Size</span>
                        <strong className="text-gray-800 font-semibold">{trip.groupSize}</strong>
                      </div>
                    </div>

                    {/* Dynamic Seat Availability Progress Bar */}
                    <SeatProgressBar trip={trip} inquiries={inquiries} variant="compact" />

                    {/* Highlights bullet previews */}
                    <div className="space-y-1 pt-1">
                      {trip.highlights.slice(0, 2).map((hl, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#004E64] shrink-0"></span>
                          <span className="truncate">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Action CTA */}
                <div className="p-5 pt-0 mt-2">
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                        Starting From
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-[#004E64]">
                          ₹{trip.price.toLocaleString()}
                        </span>
                        {trip.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{trip.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/916205054837?text=${encodeURIComponent(`Hi RoamX Team, I'd like to ask about ${trip.title} (₹${trip.price.toLocaleString()}) on RoamX.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors"
                        title={`Chat with Us about ${trip.title} on WhatsApp`}
                      >
                        <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                      </a>

                      <button
                        id={`select-trip-${trip.id}-btn`}
                        onClick={() => {
                          onSelectTrip(trip.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#004E64] text-white shadow-md'
                            : 'bg-gray-100 hover:bg-[#FF6B35] text-gray-800 hover:text-white group-hover:bg-[#FF6B35] group-hover:text-white'
                        }`}
                      >
                        <BookingLogo size="sm" variant={isCurrent ? 'white' : 'orange'} />
                        <span>{isCurrent ? 'Viewing' : 'Select'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
