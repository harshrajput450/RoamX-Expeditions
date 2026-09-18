import React from 'react';
import { Star, MapPin, Clock, Mountain, ShieldCheck, Download, Share2, Compass, Sparkles, Phone } from 'lucide-react';
import { DepartureCity, Trip, BookingInquiry } from '../types';
import { BookingInquiryCard } from './BookingInquiryCard';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BookingLogo } from './BookingLogo';

interface HeroSectionProps {
  trip: Trip;
  selectedCity: DepartureCity;
  onSelectCity: (city: DepartureCity) => void;
  selectedBatchDate?: string;
  onInquirySubmitted: (inquiry: BookingInquiry) => void;
  onOpenAIChat?: () => void;
  inquiries?: BookingInquiry[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  trip,
  selectedCity,
  onSelectCity,
  selectedBatchDate,
  onInquirySubmitted,
  onOpenAIChat,
  inquiries = [],
}) => {
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const handleDownloadBrochure = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <section className="relative bg-slate-900 text-white min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden w-full max-w-full">
      {/* Full-width Background Hero Image with Deep Contrast Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden w-full max-w-full">
        <img
          src={trip.heroImage}
          alt={trip.title}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out max-w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full max-w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Content: Title, Badges, Highlights, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-[#FF6B35] text-white font-bold text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                <Mountain className="w-3.5 h-3.5" />
                ROAMX CERTIFIED
              </span>

              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                {trip.location}
              </span>

              <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md text-amber-300 text-xs px-2.5 py-1 rounded-full border border-white/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{trip.rating}</span>
                <span className="text-gray-300">({trip.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Main Destination Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {trip.title}
              </h1>
              <p className="text-base sm:text-lg text-gray-200 max-w-2xl font-normal leading-relaxed">
                {trip.tagline}
              </p>
            </div>

            {/* Quick Hero Feature Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-gray-300 block font-medium">Duration</span>
                <span className="text-sm font-bold text-white">{trip.duration}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-gray-300 block font-medium">Grade</span>
                <span className="text-sm font-bold text-amber-300">{trip.difficulty}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-gray-300 block font-medium">Max Altitude</span>
                <span className="text-sm font-bold text-white">{trip.maxAltitude}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-gray-300 block font-medium">Age Limit</span>
                <span className="text-sm font-bold text-white">{trip.ageLimit}</span>
              </div>
            </div>

            {/* Action Buttons with Booking Emblem, WhatsApp, and AI Chat */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#departure-cities"
                className="bg-[#FF6B35] hover:bg-[#e05624] active:bg-[#c94a1d] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2"
              >
                <BookingLogo size="sm" variant="white" />
                <span>Book Dates & Cities</span>
              </a>

              {/* Working WhatsApp Quick Link */}
              <a
                href={`https://wa.me/916205054837?text=${encodeURIComponent(`Hi RoamX Team, I'd like to ask about ${trip.title} (₹${trip.price.toLocaleString()}) on RoamX.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Chat with Us</span>
              </a>

              {/* AI Trail Captain Trigger */}
              {onOpenAIChat && (
                <button
                  onClick={onOpenAIChat}
                  className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Ask AI Guide</span>
                </button>
              )}

              <button
                onClick={handleDownloadBrochure}
                className="hidden sm:inline-flex bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/20 transition-all items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>{downloadSuccess ? 'Brochure Downloaded!' : 'PDF Itinerary'}</span>
              </button>
            </div>

            {/* Micro assurance */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
                <span>Certified Trek Leaders & BMC/WFR Trained Safety Crew</span>
              </span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+916205054837"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20"
                  title="Direct Call Helpline"
                  aria-label="Direct Call Helpline"
                >
                  <Phone className="w-3.5 h-3.5 text-white" />
                </a>
                <a
                  href="https://wa.me/916205054837?text=Hi%20RoamX,%20I%20need%2024x7%20trekking%20assistance."
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors border border-emerald-400/30"
                  title="24x7 WhatsApp Assistance"
                  aria-label="24x7 WhatsApp Assistance"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                </a>
                <span className="text-xs text-gray-300 font-medium">24x7 Assistance</span>
              </div>
            </div>

          </div>

          {/* Right Floating Sidebar Booking Form (Prompt 2 requirement) */}
          <div className="lg:col-span-5 w-full">
            <BookingInquiryCard
              trip={trip}
              selectedCity={selectedCity}
              onSelectCity={onSelectCity}
              selectedBatchDate={selectedBatchDate}
              onInquirySubmitted={onInquirySubmitted}
              inquiries={inquiries}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
