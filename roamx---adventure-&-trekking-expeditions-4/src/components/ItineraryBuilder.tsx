import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Mountain,
  Utensils,
  Tent,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
} from 'lucide-react';
import { ItineraryDay } from '../types';

interface ItineraryBuilderProps {
  itinerary: ItineraryDay[];
  onChange: (updated: ItineraryDay[]) => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ itinerary, onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleAddDay = () => {
    const nextDayNum = itinerary.length + 1;
    const newDay: ItineraryDay = {
      day: nextDayNum,
      title: `Day ${nextDayNum}: Scenic Ridge & Trail Stage`,
      description: 'Experience scenic mountain views, peaceful alpine trails, and authentic regional hospitality.',
      altitude: '10,500 ft',
      stay: 'Alpine Dome Tents / Boutique Stay',
      meals: {
        breakfast: true,
        lunch: true,
        dinner: true,
      },
      highlights: ['Scenic trail vistas', 'Evening bonfire & hot meals'],
    };
    const updated = [...itinerary, newDay].map((d, idx) => ({ ...d, day: idx + 1 }));
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleRemoveDay = (index: number) => {
    if (itinerary.length <= 1) {
      alert('An expedition must have at least 1 day itinerary.');
      return;
    }
    const updated = itinerary
      .filter((_, i) => i !== index)
      .map((d, idx) => ({ ...d, day: idx + 1 }));
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(Math.max(0, index - 1));
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itinerary.length) return;

    const list = [...itinerary];
    const [removed] = list.splice(index, 1);
    list.splice(targetIndex, 0, removed);
    const updated = list.map((d, idx) => ({ ...d, day: idx + 1 }));
    onChange(updated);
    setExpandedIndex(targetIndex);
  };

  const handleFieldChange = (index: number, field: keyof ItineraryDay, val: any) => {
    const updated = itinerary.map((d, i) => (i === index ? { ...d, [field]: val } : d));
    onChange(updated);
  };

  const handleMealToggle = (index: number, meal: 'breakfast' | 'lunch' | 'dinner') => {
    const day = itinerary[index];
    const currentMeals = day.meals || { breakfast: false, lunch: false, dinner: false };
    const updatedMeals = {
      ...currentMeals,
      [meal]: !currentMeals[meal],
    };
    handleFieldChange(index, 'meals', updatedMeals);
  };

  const handleHighlightsTextChange = (index: number, text: string) => {
    // Parse comma-separated or line-separated highlights
    const highlights = text
      .split(/[\n,]/)
      .map((h) => h.trim())
      .filter(Boolean);
    handleFieldChange(index, 'highlights', highlights);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#004E64]" />
            <span>Day-by-Day Itinerary Builder ({itinerary.length} Days)</span>
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure titles, altitude tags, accommodation, meal inclusions, and key highlights for each day.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddDay}
          className="inline-flex items-center gap-1.5 bg-[#004E64] hover:bg-[#003d4d] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Day {itinerary.length + 1}</span>
        </button>
      </div>

      <div className="space-y-3">
        {itinerary.map((dayItem, idx) => {
          const isExpanded = expandedIndex === idx;
          const highlightsString = (dayItem.highlights || []).join(', ');

          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border transition-all ${
                isExpanded
                  ? 'border-[#004E64] ring-1 ring-[#004E64]/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-gray-50/70 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="bg-[#004E64] text-white font-bold text-xs px-2.5 py-1 rounded-md shrink-0">
                    Day {dayItem.day}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                      {dayItem.title || `Day ${dayItem.day} Stage`}
                    </h5>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      {dayItem.altitude && (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                          🏔️ {dayItem.altitude}
                        </span>
                      )}
                      {dayItem.stay && (
                        <span className="text-gray-600 truncate max-w-[150px]">
                          ⛺ {dayItem.stay}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        Meals: {[
                          dayItem.meals?.breakfast ? 'B' : null,
                          dayItem.meals?.lunch ? 'L' : null,
                          dayItem.meals?.dinner ? 'D' : null,
                        ].filter(Boolean).join('/') || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveDay(idx, 'up')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition-colors"
                    title="Move Day Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === itinerary.length - 1}
                    onClick={() => handleMoveDay(idx, 'down')}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition-colors"
                    title="Move Day Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Day */}
                  {itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete This Day"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Expand Chevron */}
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#004E64]" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Editable Fields Section */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-100 space-y-3.5 animate-in fade-in duration-150">
                  {/* Title & Altitude */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Day {dayItem.day} Title / Destination Stage *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Ganga Sunrise, Ghats & Sarnath"
                        value={dayItem.title}
                        onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <Mountain className="w-3 h-3 text-[#FF6B35]" />
                        <span>Altitude / Elevation Tag</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 270 ft or 12,500 ft"
                        value={dayItem.altitude || ''}
                        onChange={(e) => handleFieldChange(idx, 'altitude', e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                      />
                    </div>
                  </div>

                  {/* Full Day Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Full Day Description & Route Details *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what travelers will experience, scenic viewpoints, activities, and timings..."
                      value={dayItem.description}
                      onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] leading-relaxed"
                    />
                  </div>

                  {/* Highlights (Comma-separated) */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#FF6B35]" />
                        <span>Key Day Highlights (Comma-separated)</span>
                      </span>
                      <span className="text-[10px] text-gray-400">e.g. Sunrise Boat Ride, Sarnath Stupa, Ganga Aarti</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunrise Boat Ride, Sarnath Stupa, Street Food Trail, Evening Ganga Aarti"
                      value={highlightsString}
                      onChange={(e) => handleHighlightsTextChange(idx, e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    {dayItem.highlights && dayItem.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {dayItem.highlights.map((h, hIdx) => (
                          <span
                            key={hIdx}
                            className="bg-orange-50 text-[#FF6B35] border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                            <span>{h}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Accommodation & Included Meals */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <Tent className="w-3 h-3 text-[#004E64]" />
                        <span>Accommodation Type</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Heritage Haveli / Alpine Camps / Boutique Stay"
                        value={dayItem.stay || ''}
                        onChange={(e) => handleFieldChange(idx, 'stay', e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-[#004E64]" />
                        <span>Included Meals (Check to mark included)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleMealToggle(idx, 'breakfast')}
                          className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            dayItem.meals?.breakfast
                              ? 'bg-blue-50 text-[#004E64] border-blue-300 shadow-2xs'
                              : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {dayItem.meals?.breakfast && <Check className="w-3.5 h-3.5 text-[#004E64]" />}
                          <span>Breakfast</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMealToggle(idx, 'lunch')}
                          className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            dayItem.meals?.lunch
                              ? 'bg-blue-50 text-[#004E64] border-blue-300 shadow-2xs'
                              : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {dayItem.meals?.lunch && <Check className="w-3.5 h-3.5 text-[#004E64]" />}
                          <span>Lunch</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMealToggle(idx, 'dinner')}
                          className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            dayItem.meals?.dinner
                              ? 'bg-blue-50 text-[#004E64] border-blue-300 shadow-2xs'
                              : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {dayItem.meals?.dinner && <Check className="w-3.5 h-3.5 text-[#004E64]" />}
                          <span>Dinner</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
