import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Compass, Mountain, Clock, MapPin, Sparkles, ChevronRight, Tag, Check, ArrowRight } from 'lucide-react';
import { Trip } from '../types';

interface GlobalSearchBarProps {
  trips: Trip[];
  activeTrip: Trip;
  onSelectTrip: (tripId: string) => void;
  className?: string;
}

const POPULAR_QUICK_FILTERS = [
  { label: 'Weekend Trips', query: '2 Days' },
  { label: 'Uttarakhand', query: 'Uttarakhand' },
  { label: 'Himachal', query: 'Himachal' },
  { label: 'Spiritual & Heritage', query: 'Vrindavan' },
  { label: 'Desert & Culture', query: 'Pushkar' },
  { label: 'Snow & Alpine Treks', query: 'Trek' },
  { label: 'Under ₹6,000', query: 'budget' },
];

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & match logic with top ranking relevance score
  const filteredTrips = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return trips;
    }

    if (trimmed === 'budget' || trimmed === 'under 10k' || trimmed === 'under 10000' || trimmed === 'under ₹6,000') {
      return trips.filter((t) => t.price <= 10000);
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean);

    // Compute ranking score for each trip
    const scoredTrips = trips
      .map((trip) => {
        const titleLower = trip.title.toLowerCase();
        const locationLower = trip.location.toLowerCase();
        const taglineLower = (trip.tagline || '').toLowerCase();
        const highlightsLower = (trip.highlights || []).join(' ').toLowerCase();
        const diffLower = (trip.difficulty || '').toLowerCase();
        const durationLower = (trip.duration || '').toLowerCase();

        let score = 0;

        // Title exact match
        if (titleLower === trimmed) {
          score += 1000;
        }
        // Title starts with query (e.g. "sp" -> "Spiti Valley Expedition")
        else if (titleLower.startsWith(trimmed)) {
          score += 500;
        }
        // Any word in title starts with query
        else if (titleLower.split(/\s+/).some((word) => word.startsWith(trimmed))) {
          score += 300;
        }
        // Title contains query anywhere
        else if (titleLower.includes(trimmed)) {
          score += 200;
        }

        // Location exact or prefix match
        if (locationLower.startsWith(trimmed)) {
          score += 150;
        } else if (locationLower.includes(trimmed)) {
          score += 100;
        }

        // Tagline / Highlights match
        if (taglineLower.includes(trimmed)) {
          score += 60;
        }
        if (highlightsLower.includes(trimmed)) {
          score += 40;
        }
        if (diffLower.includes(trimmed) || durationLower.includes(trimmed)) {
          score += 30;
        }

        // Check if all individual tokens match somewhere in trip metadata
        const fullSearchable = [
          titleLower,
          locationLower,
          taglineLower,
          highlightsLower,
          diffLower,
          durationLower,
          trip.maxAltitude || '',
          trip.bestSeason || '',
          ...(trip.departureCities?.map((c) => c.city.toLowerCase()) || []),
        ].join(' ');

        const allTokensMatch = tokens.every((token) => fullSearchable.includes(token));
        if (allTokensMatch) {
          score += 20;
        }

        return { trip, score, allTokensMatch };
      })
      .filter((item) => item.score > 0 || item.allTokensMatch);

    // Sort by relevance score descending
    scoredTrips.sort((a, b) => b.score - a.score);

    return scoredTrips.map((item) => item.trip);
  }, [trips, query]);

  const handleSelectTrip = (tripId: string) => {
    onSelectTrip(tripId);
    setIsOpen(false);
    setQuery('');
    // Smooth scroll to highlights
    const elem = document.getElementById('trip-highlights');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredTrips.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredTrips.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredTrips.length) {
        handleSelectTrip(filteredTrips[selectedIndex].id);
      } else if (filteredTrips.length > 0) {
        handleSelectTrip(filteredTrips[0].id);
      }
    }
  };

  const getDifficultyBadge = (difficulty: Trip['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Easy to Moderate':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Moderate':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Moderate to Difficult':
      case 'Difficult':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-[#004E64] border-blue-200';
    }
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-gray-400">
          <Search className="w-3.5 h-3.5 text-[#004E64]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search treks, trips, places..."
          className="w-full min-w-0 max-w-full bg-gray-100/90 hover:bg-gray-100 focus:bg-white text-xs text-gray-900 placeholder:text-gray-400 pl-8.5 pr-10 sm:pr-14 py-2 rounded-full border border-gray-200 focus:border-[#004E64] focus:ring-2 focus:ring-[#004E64]/20 transition-all outline-none"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 bg-white border border-gray-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Instant Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-[480px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Quick Filters / Tag Bar */}
          <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-gray-200/80">
            <div className="flex items-center justify-between gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FF6B35]" />
                <span>Popular Searches & Filters:</span>
              </span>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs text-[#004E64] hover:underline font-semibold"
                >
                  Show All ({trips.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_QUICK_FILTERS.map((filter) => {
                const isActive = query.toLowerCase() === filter.query.toLowerCase();
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => {
                      setQuery(filter.query);
                      inputRef.current?.focus();
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#004E64] text-white border-[#004E64]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{filter.label}</span>
                    {isActive && <Check className="w-2.5 h-2.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-gray-100">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip, idx) => {
                const isSelected = idx === selectedIndex;
                const isCurrentActive = trip.id === activeTrip.id;

                return (
                  <div
                    key={trip.id}
                    onClick={() => handleSelectTrip(trip.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200/60 shadow-xs'
                        : 'hover:bg-gray-50/80 border border-transparent'
                    } ${isCurrentActive ? 'ring-1 ring-[#004E64]/20' : ''}`}
                  >
                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 relative shadow-2xs">
                      <img
                        src={trip.heroImage}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isCurrentActive && (
                        <span className="absolute bottom-1 right-1 bg-[#004E64] text-white text-[8px] font-bold px-1 py-0.5 rounded shadow-xs">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Trip Info Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {trip.title}
                        </h4>
                        <span className="text-xs font-black text-[#004E64] whitespace-nowrap">
                          ₹{trip.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Location and Mountain range */}
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2 truncate">
                        <MapPin className="w-3 h-3 text-[#FF6B35] shrink-0" />
                        <span className="truncate">{trip.location}</span>
                      </div>

                      {/* Badges: Difficulty, Duration, Altitude */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Difficulty Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDifficultyBadge(
                            trip.difficulty
                          )}`}
                        >
                          {trip.difficulty}
                        </span>

                        {/* Duration Badge */}
                        <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-gray-500" />
                          <span>{trip.duration.split('/')[0].trim()}</span>
                        </span>

                        {/* Altitude Badge */}
                        {trip.maxAltitude && (
                          <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1 hidden sm:inline-flex">
                            <Mountain className="w-2.5 h-2.5 text-gray-500" />
                            <span>{trip.maxAltitude.split('(')[0].trim()}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="self-center pl-1 text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty State */
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-2 text-[#FF6B35]">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-800">No matching treks found</h4>
                <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                  Try searching with broader terms like <strong className="text-gray-700">"Easy"</strong>, <strong className="text-gray-700">"5 Days"</strong>, <strong className="text-gray-700">"Spiti"</strong>, or <strong className="text-gray-700">"Snow"</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-3 text-xs font-bold text-[#004E64] hover:underline"
                >
                  Clear search query
                </button>
              </div>
            )}
          </div>

          {/* Footer Guide Info */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#004E64]" />
              <span>{filteredTrips.length} expedition{filteredTrips.length === 1 ? '' : 's'} available</span>
            </span>
            <span className="hidden sm:inline">Use ↑↓ arrows to navigate, Enter to select</span>
          </div>

        </div>
      )}
    </div>
  );
};
