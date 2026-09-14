import React, { useState } from 'react';
import { MessageCircle, X, Phone, Send, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Trip } from '../types';

interface WhatsAppButtonProps {
  activeTrip: Trip;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ activeTrip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const officialNumber = '916205054837';
  const defaultText = `Hi RoamX Team, I'm interested in booking the ${activeTrip.title} (₹${activeTrip.price.toLocaleString()}) on RoamX. Please share available batch slots and ₹500 token booking details.`;

  const handleSendWhatsApp = (textToSend?: string) => {
    const message = textToSend || customMsg || defaultText;
    const url = `https://wa.me/${officialNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-18 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end print:hidden">
      {/* Popover WhatsApp Quick Chat Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center border border-white/40">
                    <WhatsAppIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>RoamX Support Team</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  </h4>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span>Online • Instant Reply</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 bg-gray-50/50 space-y-3">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs text-xs text-gray-700">
              <p className="font-medium text-gray-900 mb-1">
                Namaste trekker! 👋 How can we help you today?
              </p>
              <p className="text-gray-500 text-[11px]">
                Ask about <strong className="text-gray-700">{activeTrip.title}</strong>, custom group discounts, ₹500 token deposits, or packing advice.
              </p>
            </div>

            {/* Quick Prompt Pills */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Quick Options:
              </div>
              <button
                onClick={() => handleSendWhatsApp(`Hi RoamX Team, please send batch dates & itinerary for ${activeTrip.title}.`)}
                className="w-full text-left text-[11px] bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 p-2 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors flex items-center justify-between"
              >
                <span>📅 Send batch dates & PDF itinerary</span>
                <span className="text-emerald-600 font-bold">→</span>
              </button>
              <button
                onClick={() => handleSendWhatsApp(`Hi RoamX Team, I want to book ${activeTrip.title} with ₹500 token deposit via UPI (harshkumarsingh450-3@okicici).`)}
                className="w-full text-left text-[11px] bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 p-2 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors flex items-center justify-between"
              >
                <span>💳 Book now with ₹500 token</span>
                <span className="text-emerald-600 font-bold">→</span>
              </button>
            </div>

            {/* Custom Input */}
            <div className="relative pt-1">
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your message here..."
                rows={2}
                className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
              />
              <button
                onClick={() => handleSendWhatsApp()}
                className="mt-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="floating-whatsapp-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white"
        aria-label="Chat with Us on WhatsApp"
        title="WhatsApp Support"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping -z-10"></span>

        <WhatsAppIcon className="w-6 h-6 text-white shrink-0" />
        
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          Chat with us
        </span>

        {/* Online Indicator Dot */}
        <span className="w-2.5 h-2.5 bg-white rounded-full shadow-xs"></span>
      </button>
    </div>
  );
};
