import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Trip, DepartureCity } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { BookingLogo } from './BookingLogo';

interface MobileStickyBookingBarProps {
  trip: Trip;
  selectedCity: DepartureCity;
  onOpenBooking?: () => void;
}

export const MobileStickyBookingBar: React.FC<MobileStickyBookingBarProps> = ({
  trip,
  selectedCity,
  onOpenBooking,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past hero section (approx 450px)
      const scrolledPastHero = window.scrollY > 450;
      setIsVisible(scrolledPastHero);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      // Scroll to the booking card or departure cities selector
      const bookingCard = document.getElementById('booking-card') || document.getElementById('departure-cities');
      if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const whatsappUrl = `https://wa.me/916205054837?text=${encodeURIComponent(
    `Hi RoamX Team! I am interested in booking the ${trip.title} (From ${selectedCity.city} - ₹${selectedCity.price.toLocaleString()}). Please share upcoming batch dates.`
  )}`;

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] px-4 py-2.5 transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Price & Token Deposit Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 line-through">
              ₹{((selectedCity.price || trip.price) + 2500).toLocaleString()}
            </span>
            <span className="text-lg font-black text-gray-950 leading-none">
              ₹{(selectedCity.price || trip.price).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
              <span>₹500 Token Deposit</span>
            </span>
            <span className="text-[10px] text-gray-500 truncate hidden xs:inline">
              • {selectedCity.city}
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick WhatsApp Inquiry */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-colors"
            title="Chat with trek coordinator"
            aria-label="WhatsApp coordinator"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white" />
          </a>

          {/* Prominent Book Now Button */}
          <button
            id="mobile-sticky-book-now"
            onClick={handleBookNow}
            className="bg-gradient-to-r from-[#FF6B35] to-[#E85D26] hover:from-[#E85D26] hover:to-[#D94F1A] active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
