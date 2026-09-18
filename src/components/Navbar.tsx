import React from 'react';
import { Compass, Shield, Settings, Code, Phone, ChevronDown, Mountain, Sparkles, HelpCircle, Lock, ShieldCheck, LogOut, MessageCircle } from 'lucide-react';
import { Trip } from '../types';
import { Logo } from './Logo';
import { GlobalSearchBar } from './GlobalSearchBar';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BookingLogo } from './BookingLogo';

interface NavbarProps {
  trips: Trip[];
  activeTrip: Trip;
  onSelectTrip: (tripId: string) => void;
  onOpenAdmin: () => void;
  onOpenAIChat?: () => void;
  inquiriesCount?: number;
  isAdminAuthenticated?: boolean;
  adminEmail?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenAdmin,
  onOpenAIChat,
  inquiriesCount = 0,
  isAdminAuthenticated = false,
  adminEmail,
  onLogout,
}) => {
  const [isTripMenuOpen, setIsTripMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs w-full max-w-full shrink-0">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full shrink-0">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-4 w-full">
          
          {/* Left: Brand Logo & Quick Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-5 shrink-0 min-w-0">
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Logo size="md" variant="dark" />
            </div>

            {/* Quick Trip Selector Dropdown */}
            <div className="relative shrink-0">
              <button
                id="trip-selector-dropdown-btn"
                onClick={() => setIsTripMenuOpen(!isTripMenuOpen)}
                className="hidden xl:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 transition-all"
                title="Switch Expedition"
              >
                <Compass className="w-3.5 h-3.5 text-[#004E64]" />
                <span className="max-w-[130px] truncate">{activeTrip.title}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isTripMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTripMenuOpen && (
                <div
                  id="trip-selector-menu"
                  className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select Expedition Trip
                  </div>
                  {trips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTrip(t.id);
                        setIsTripMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-blue-50/50 transition-colors ${
                        t.id === activeTrip.id ? 'bg-blue-50/70 text-[#004E64] font-bold' : 'text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{t.title}</div>
                        <div className="text-[11px] text-gray-500">{t.duration} • ₹{t.price.toLocaleString()}</div>
                      </div>
                      {t.id === activeTrip.id && (
                        <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 min-w-0 max-w-md mx-1 sm:mx-2 shrink">
            <GlobalSearchBar
              trips={trips}
              activeTrip={activeTrip}
              onSelectTrip={onSelectTrip}
              className="w-full min-w-0"
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* AI Expedition Assistant Trigger */}
            {onOpenAIChat && (
              <button
                id="navbar-ai-assistant-btn"
                onClick={onOpenAIChat}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-[#004E64] border border-orange-300/60 px-2 sm:px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs group shrink-0"
                title="Ask Gemini AI Trail Guide"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B35] animate-pulse" />
                <span className="hidden sm:inline">AI Guide</span>
              </button>
            )}

            {/* Quick WhatsApp Connect Icon Button */}
            <a
              id="expert-contact-btn"
              href="https://wa.me/916205054837?text=Hi%20RoamX,%20I%20am%20interested%20in%20booking%20an%20expedition%20on%20RoamX."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs shrink-0"
              title="RoamX Official WhatsApp Support"
              aria-label="RoamX Official WhatsApp Support"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            </a>

            {/* Public Booking CTA with Booking Emblem */}
            <a
              id="public-book-now-nav-btn"
              href="#departure-cities"
              className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold bg-[#004E64] hover:bg-[#003d4d] text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <BookingLogo size="sm" variant="white" />
              <span className="hidden xs:inline">Book Batch</span>
              <span className="xs:hidden">Book Batch</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};

