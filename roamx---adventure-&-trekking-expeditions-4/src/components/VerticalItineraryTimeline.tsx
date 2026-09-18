import React, { useState } from 'react';
import { ChevronDown, MapPin, Utensils, Tent, Navigation, CheckCircle, Flame, Mountain, Clock } from 'lucide-react';
import { Trip, ItineraryDay } from '../types';

interface VerticalItineraryTimelineProps {
  trip: Trip;
}

export const VerticalItineraryTimeline: React.FC<VerticalItineraryTimelineProps> = ({ trip }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <section id="itinerary-timeline" className="py-12 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
            Day-by-Day Expedition Plan
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Detailed Itinerary & Route
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Every day is curated with proper acclimatization breaks, hot mountain meals, and scenic vantage points.
          </p>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative pl-6 sm:pl-10 space-y-6 sm:space-y-8 before:absolute before:left-3 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
          
          {trip.itinerary.map((dayItem: ItineraryDay) => {
            const isExpanded = expandedDay === dayItem.day;

            return (
              <div
                key={dayItem.day}
                id={`itinerary-day-${dayItem.day}`}
                className="relative group transition-all"
              >
                {/* Timeline Marker Dot */}
                <div
                  onClick={() => toggleDay(dayItem.day)}
                  className={`absolute -left-6 sm:-left-10 top-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-transform cursor-pointer shadow-md ${
                    isExpanded
                      ? 'bg-[#FF6B35] text-white ring-4 ring-orange-100 scale-110'
                      : 'bg-white text-gray-700 border-2 border-[#004E64] group-hover:scale-105'
                  }`}
                >
                  {dayItem.day}
                </div>

                {/* Day Card */}
                <div
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-[#004E64] shadow-sm ring-1 ring-[#004E64]/10'
                      : 'border-gray-200 shadow-xs hover:border-gray-300'
                  }`}
                >
                  {/* Clickable Header Bar */}
                  <div
                    onClick={() => toggleDay(dayItem.day)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-blue-100 text-[#004E64] px-2 py-0.5 rounded">
                          Day {dayItem.day}
                        </span>

                        {dayItem.altitude && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                            <Mountain className="w-3 h-3 text-amber-600" />
                            {dayItem.altitude}
                          </span>
                        )}

                        {dayItem.trekDuration && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            {dayItem.trekDuration}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        {dayItem.title}
                      </h3>

                      {dayItem.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                          {dayItem.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <div className="p-1 rounded-full text-gray-400 group-hover:text-gray-600">
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#004E64]' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expandable Body */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-gray-100 space-y-4">
                      
                      {/* Description Text */}
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {dayItem.description}
                      </p>

                      {/* Day Highlights List */}
                      {dayItem.highlights && dayItem.highlights.length > 0 && (
                        <div className="bg-[#F8F9FA] rounded-xl p-3.5 border border-gray-200">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Key Day Highlights
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {dayItem.highlights.map((h, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-800 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0" />
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Info Bar: Stay & Meal Indicators */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        
                        {/* Stay Details */}
                        <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-blue-50/50 border border-blue-100 p-2.5 rounded-lg">
                          <Tent className="w-4 h-4 text-[#004E64] shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-bold">Accommodation</span>
                            <span className="font-semibold text-gray-900">{dayItem.stay}</span>
                          </div>
                        </div>

                        {/* Meal Indicators */}
                        <div className="flex items-center gap-2.5 text-xs text-gray-700 bg-orange-50/40 border border-orange-100 p-2.5 rounded-lg">
                          <Utensils className="w-4 h-4 text-[#FF6B35] shrink-0" />
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase font-bold">Included Meals</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                  dayItem.meals.breakfast
                                    ? 'bg-blue-100 text-[#004E64]'
                                    : 'bg-gray-100 text-gray-400 line-through'
                                }`}
                              >
                                Breakfast
                              </span>
                              <span
                                className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                  dayItem.meals.lunch
                                    ? 'bg-blue-100 text-[#004E64]'
                                    : 'bg-gray-100 text-gray-400 line-through'
                                }`}
                              >
                                Lunch
                              </span>
                              <span
                                className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                  dayItem.meals.dinner
                                    ? 'bg-blue-100 text-[#004E64]'
                                    : 'bg-gray-100 text-gray-400 line-through'
                                }`}
                              >
                                Dinner
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
};
