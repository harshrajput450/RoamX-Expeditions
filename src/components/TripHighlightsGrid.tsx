import React from 'react';
import { Clock, Mountain, Users, Compass, Utensils, Tent, Bus, ShieldCheck, HeartPulse, Check, Sparkles, Award } from 'lucide-react';
import { Trip, BookingInquiry } from '../types';
import { SeatProgressBar } from './SeatProgressBar';

interface TripHighlightsGridProps {
  trip: Trip;
  inquiries?: BookingInquiry[];
}

export const TripHighlightsGrid: React.FC<TripHighlightsGridProps> = ({ trip, inquiries = [] }) => {
  return (
    <section id="trip-highlights" className="py-12 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">Expedition Snapshot</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Trip Highlights & Inclusions
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Award className="w-4 h-4 text-[#004E64]" />
            <span>Grade: <strong className="text-gray-900">{trip.difficulty}</strong></span>
          </div>
        </div>

        {/* 4 Essential Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-[#004E64]/30 transition-all flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-blue-50 text-[#004E64]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Duration</div>
              <div className="text-base font-bold text-gray-900">{trip.duration}</div>
              <div className="text-[11px] text-gray-400">All Nights Included</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-[#004E64]/30 transition-all flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-orange-50 text-[#FF6B35]">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Max Altitude</div>
              <div className="text-base font-bold text-gray-900">{trip.maxAltitude}</div>
              <div className="text-[11px] text-gray-400">Gradual Acclimatization</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-[#004E64]/30 transition-all flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-blue-50 text-[#004E64]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Age Eligibility</div>
              <div className="text-base font-bold text-gray-900">{trip.ageLimit}</div>
              <div className="text-[11px] text-gray-400">Solo & Group Friendly</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-[#004E64]/30 transition-all flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-orange-50 text-[#FF6B35]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Trek Difficulty</div>
              <div className="text-base font-bold text-gray-900">{trip.difficulty}</div>
              <div className="text-[11px] text-gray-400">Beginner to Regulars</div>
            </div>
          </div>

        </div>

        {/* Dynamic Seat Availability Progress Bar Banner */}
        <div className="mb-8">
          <SeatProgressBar trip={trip} inquiries={inquiries} variant="detailed" />
        </div>

        {/* Key Inclusions Visual Cards (Food, Accommodation, Travelling, Leader) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          <div className="bg-[#F8F9FA] p-5 rounded-xl border border-gray-200 flex items-start gap-3.5">
            <div className="p-3 bg-blue-100/70 text-[#004E64] rounded-xl shrink-0">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Nutritious Mountain Meals</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Hot high-energy vegetarian breakfasts, packed lunches on trails, evening snacks & soups, and wholesome dinners.
              </p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-5 rounded-xl border border-gray-200 flex items-start gap-3.5">
            <div className="p-3 bg-orange-100/70 text-[#FF6B35] rounded-xl shrink-0">
              <Tent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Cozy Stays & Alpine Tents</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                4-season waterproof alpine tents, -15°C sub-zero sleeping bags, foam insulation mats & rustic local village homestays.
              </p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-5 rounded-xl border border-gray-200 flex items-start gap-3.5">
            <div className="p-3 bg-blue-100/70 text-[#004E64] rounded-xl shrink-0">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Transfers & Multi-City Connect</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Dedicated mountain Tempo Travelers / Boleros with vetted mountain drivers and luxury AC Volvo connections from Delhi/Mumbai/Pune.
              </p>
            </div>
          </div>

        </div>

        {/* Detailed Highlight Bullets */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B35]" />
            <span>Why This Expedition Is Special</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trip.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-[#004E64] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs border border-blue-100">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
