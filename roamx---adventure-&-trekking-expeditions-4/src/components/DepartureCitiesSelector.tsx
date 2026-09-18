import React, { useState } from 'react';
import { MapPin, Calendar, Check, AlertCircle, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { DepartureCity, Trip, BatchDate } from '../types';
import { BookingLogo } from './BookingLogo';
import { WhatsAppIcon } from './WhatsAppIcon';

interface DepartureCitiesSelectorProps {
  trip: Trip;
  selectedCity: DepartureCity;
  onSelectCity: (city: DepartureCity) => void;
  selectedBatchDate?: string;
  onSelectBatchDate: (date: string, month: string) => void;
}

export const DepartureCitiesSelector: React.FC<DepartureCitiesSelectorProps> = ({
  trip,
  selectedCity,
  onSelectCity,
  selectedBatchDate,
  onSelectBatchDate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(trip.batches[0]?.month || '');

  const activeBatch = trip.batches.find((b) => b.month === selectedMonth) || trip.batches[0];

  return (
    <section id="departure-cities" className="py-12 bg-[#F8F9FA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              <BookingLogo size="sm" variant="orange" />
              Custom Pricing & Flexible Travel
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Choose Your Departure City & Dates
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Select where you want to start your journey. Prices include ground transport, transfers, permits, and expedition gear.
            </p>
          </div>

          <a
            href={`https://wa.me/916205054837?text=${encodeURIComponent(`Hi RoamX Team, please share custom pickup points & date availability for ${trip.title}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition-colors shrink-0"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            <span>Chat with Us on WhatsApp</span>
          </a>
        </div>

        {/* 1. Departure Cities Selector Grid */}
        <div className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#004E64]" />
            <span>Select Departure Hub</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {trip.departureCities.map((cityObj) => {
              const isSelected = selectedCity.city === cityObj.city;
              return (
                <button
                  key={cityObj.city}
                  onClick={() => onSelectCity(cityObj)}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#004E64] bg-blue-50/60 shadow-sm ring-1 ring-[#004E64]/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {cityObj.isPopular && (
                    <span className="absolute -top-2.5 right-3 bg-[#FF6B35] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Popular Hub
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900">{cityObj.city}</h4>
                      {isSelected && <Check className="w-4 h-4 text-[#004E64] shrink-0" />}
                    </div>
                    {cityObj.note && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{cityObj.note}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Starting from</span>
                      <span className="text-lg font-bold text-[#004E64]">₹{cityObj.price.toLocaleString()}</span>
                    </div>
                    <span className="text-[11px] text-gray-500">/ person</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Month Tabs & Batch Dates */}
        <div id="batches-section" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#004E64]" />
                <span>Upcoming Scheduled Batches</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Max 16 travelers per batch for personalized attention and safety.
              </p>
            </div>

            {/* Month Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {trip.batches.map((batch) => {
                const isSelected = (selectedMonth || trip.batches[0]?.month) === batch.month;
                return (
                  <button
                    key={batch.month}
                    onClick={() => setSelectedMonth(batch.month)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#004E64] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {batch.month}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Batch Date Cards */}
          {activeBatch && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeBatch.dates.map((dateStr) => {
                const isDateSelected = selectedBatchDate === dateStr;
                const isFilling = activeBatch.status === 'Filling Fast' || dateStr.includes('Christmas') || dateStr.includes('New Year');

                return (
                  <div
                    key={dateStr}
                    onClick={() => onSelectBatchDate(dateStr, activeBatch.month)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDateSelected
                        ? 'bg-blue-50/60 border-2 border-[#004E64] ring-1 ring-[#004E64]/20'
                        : 'bg-[#F8F9FA] border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isFilling
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isFilling ? '🔥 Filling Fast (4 seats left)' : '✓ Seats Available'}
                        </span>
                      </div>
                    </div>

                    <a
                      href="#booking-section"
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1 ${
                        isDateSelected
                          ? 'bg-[#004E64] text-white'
                          : 'bg-gray-200 hover:bg-[#004E64] hover:text-white text-gray-700'
                      }`}
                    >
                      <span>{isDateSelected ? 'Selected' : 'Book Batch'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom Date Notice */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Planning a customized private group or corporate batch?</span>
            </span>
            <a
              href="#booking-section"
              className="text-[#004E64] font-bold hover:underline"
            >
              Request Custom Dates on Booking Form &rarr;
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
