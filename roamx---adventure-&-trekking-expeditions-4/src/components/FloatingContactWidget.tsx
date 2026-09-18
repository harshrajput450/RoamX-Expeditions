import React from 'react';
import { Sparkles, Ticket, ChevronUp, MapPin, Phone } from 'lucide-react';
import { WhatsAppIcon, BookingTicketIcon } from './Icons';

interface FloatingContactWidgetProps {
  onOpenAiGuide: () => void;
  onOpenBooking: () => void;
  activeTripTitle: string;
}

export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({
  onOpenAiGuide,
  onOpenBooking,
  activeTripTitle,
}) => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = `https://wa.me/916205054837?text=${encodeURIComponent(
    `Hi RoamX Team! I am interested in booking the ${activeTripTitle} expedition. Can you please share batch dates and token booking details?`
  )}`;

  return (
    <aside aria-label="Quick contact and booking options" className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-4">
      {/* Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer backdrop-blur-xs"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* 1. Gemini AI Expedition Guide Button */}
      <button
        id="floating-ai-guide-btn"
        onClick={onOpenAiGuide}
        className="group flex items-center gap-2 bg-gradient-to-r from-[#004E64] to-[#002D3A] text-white hover:from-[#003D4E] hover:to-[#001F29] px-3.5 py-2.5 rounded-full shadow-xl border border-cyan-400/30 transition-all hover:scale-105 cursor-pointer"
        title="Ask RoamX AI Mountain Guide (Maps Grounded)"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF6B35] rounded-full animate-ping" />
        </div>
        <span className="text-xs font-bold whitespace-nowrap">Ask AI Guide</span>
        <span className="hidden sm:inline bg-cyan-400/20 text-cyan-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-cyan-400/30">
          Maps AI
        </span>
      </button>

      {/* 2. Direct Helpline Call & WhatsApp Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Direct Call Button */}
        <a
          id="floating-call-btn"
          href="tel:+916205054837"
          className="group flex items-center justify-center w-11 h-11 bg-[#004E64] hover:bg-[#003d4d] text-white rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer ring-4 ring-cyan-700/20 border border-white/30"
          title="Call Helpline"
          aria-label="Call Helpline"
        >
          <Phone className="w-5 h-5 text-white" />
        </a>

        {/* Direct Official WhatsApp Chat Button */}
        <a
          id="floating-whatsapp-btn"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa4f] text-white px-3.5 py-2.5 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer ring-4 ring-emerald-500/20"
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <div className="relative flex items-center justify-center">
            <WhatsAppIcon className="w-5 h-5 fill-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-100 rounded-full border-2 border-[#25D366] animate-ping" />
          </div>
          <span className="text-xs font-bold whitespace-nowrap">WhatsApp</span>
        </a>
      </div>

      {/* 3. Fast-Track Book Now Ticket Button */}
      <button
        id="floating-book-now-btn"
        onClick={onOpenBooking}
        className="group flex items-center gap-2 bg-[#FF6B35] hover:bg-[#e05624] text-white px-4 py-2.5 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer ring-4 ring-orange-500/20"
        title="Instant Token Booking (₹500 Deposit)"
      >
        <BookingTicketIcon className="w-4 h-4 text-white" />
        <span className="text-xs font-black tracking-wide">Book Slot (₹500)</span>
      </button>
    </aside>
  );
};
