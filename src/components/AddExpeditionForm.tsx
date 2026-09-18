import React, { useState } from 'react';
import {
  Mountain,
  Plus,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  MapPin,
  DollarSign,
  Users,
  Award,
  ListPlus,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Trip, ItineraryDay, DepartureCity, BatchDate } from '../types';
import { ItineraryBuilder } from './ItineraryBuilder';
import { GearChecklistBuilder } from './GearChecklistBuilder';

interface AddExpeditionFormProps {
  onSuccess: (newTrip: Trip) => void;
}

export const AddExpeditionForm: React.FC<AddExpeditionFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Core Properties
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('Uttarakhand, Himalayas');
  const [price, setPrice] = useState<number>(7999);
  const [originalPrice, setOriginalPrice] = useState<number>(10999);
  const [duration, setDuration] = useState('5 Days / 4 Nights');
  const [maxAltitude, setMaxAltitude] = useState('12,500 ft');
  const [difficulty, setDifficulty] = useState<Trip['difficulty']>('Moderate');
  const [ageLimit, setAgeLimit] = useState('18 to 35 Years');
  const [groupSize, setGroupSize] = useState('12-16 Trekkers');
  const [bestSeason, setBestSeason] = useState('Oct - April');
  const [heroImage, setHeroImage] = useState(
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80'
  );
  const [isLiveImmediately, setIsLiveImmediately] = useState(false);

  // Highlights & Inclusions text areas (line-by-line)
  const [highlightsText, setHighlightsText] = useState(
    '360-degree panoramic summit view\nStarlit campsites amidst pristine snow\nCertified Wilderness First Responder trek leaders\nMicrospikes & safety gear included'
  );
  const [inclusionsText, setInclusionsText] = useState(
    'All vegetarian meals (Breakfast, Lunch, Snacks, Dinner) on trail\nHigh-altitude alpine dome tents on triple sharing\nMicrospikes, gaiters, and safety equipment\nState forest permits and entry fees\nExperienced trek leader and local guide'
  );
  const [exclusionsText, setExclusionsText] = useState(
    'Transportation to base camp unless chosen in departure package\nBackpack offloading charges (₹400/day)\nPersonal trekking gear (boots, warm clothing)\nAny insurance or personal medical emergency costs'
  );

  // Departure Cities
  const [departureCities, setDepartureCities] = useState<DepartureCity[]>([
    { city: 'Dehradun (Base)', price: 7999 },
    { city: 'Delhi', price: 9999 },
    { city: 'Mumbai', price: 12999 },
    { city: 'Bengaluru', price: 13999 },
  ]);

  // Day-by-Day Itinerary Builder
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    {
      day: 1,
      title: 'Arrival at Basecamp & Acclimatization Briefing',
      description:
        'Drive through scenic pine valleys. Arrive at basecamp, settle into your lodge/campsite, followed by equipment briefing and evening hot tea.',
      altitude: '6,400 ft',
      stay: 'Basecamp Guesthouse / Alpine Tents',
      meals: { breakfast: false, lunch: false, dinner: true },
      highlights: ['Scenic valley drive', 'Campfire briefing'],
    },
    {
      day: 2,
      title: 'Trek to First High-Altitude Ridge Camp',
      description:
        'Ascend through dense oak and rhododendron forests. Enjoy scenic valley views as we set up camp under starlit Himalayan skies.',
      altitude: '9,200 ft',
      stay: 'Alpine Dome Tents',
      meals: { breakfast: true, lunch: true, dinner: true },
      highlights: ['Forest ascent', 'Ridge camp sunset'],
    },
    {
      day: 3,
      title: 'Summit Push & Sunset Descent',
      description:
        'Early morning 4 AM summit push with headlamps. Witness breathtaking Himalayan sunrise over 7,000m peaks before descending.',
      altitude: '12,500 ft',
      stay: 'Basecamp / Ridge Tents',
      meals: { breakfast: true, lunch: true, dinner: true },
      highlights: ['Sunrise summit push', 'Panoramic views'],
    },
  ]);

  // Gear Checklist Builder (Things to Pack & Carry)
  const [thingsToCarry, setThingsToCarry] = useState<{ category: string; items: string[] }[]>([
    {
      category: 'Clothing & Footwear',
      items: [
        'High-ankle trekking shoes with good grip',
        'Fleece jacket / Windcheater layer',
        'Thermal base layer (top & bottom)',
        'Quick-dry trekking pants & t-shirts',
        'Woolen gloves & sun cap',
      ],
    },
    {
      category: 'Gear & Essentials',
      items: [
        '50-60L Backpack with rain cover',
        '20L Daypack for summit push',
        'Headlamp / Torch with extra batteries',
        'UV-protected polarized sunglasses',
        '2L Insulated thermos / water bottle',
      ],
    },
    {
      category: 'First Aid & Toiletries',
      items: [
        'Personal medications & Diamox (AMS)',
        'Sunscreen SPF 50+ & lip balm',
        'Biodegradable wet wipes & sanitizer',
        'Band-aids, crepe bandage & ORS sachets',
      ],
    },
  ]);

  // Image Upload helper
  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setHeroImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add / Remove Departure City
  const handleAddCity = () => {
    setDepartureCities((prev) => [...prev, { city: 'New City', price: price }]);
  };
  const handleRemoveCity = (index: number) => {
    setDepartureCities((prev) => prev.filter((_, i) => i !== index));
  };
  const handleCityChange = (index: number, field: 'city' | 'price', val: any) => {
    setDepartureCities((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: field === 'price' ? Number(val) || 0 : val } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter an expedition title');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const newTripPayload: Partial<Trip> = {
      title: title.trim(),
      tagline: tagline.trim() || `Explore the majestic trails of ${location}`,
      location: location.trim(),
      price: Number(price) || 7999,
      originalPrice: Number(originalPrice) || Number(price) + 3000,
      duration: duration.trim(),
      maxAltitude: maxAltitude.trim(),
      difficulty,
      ageLimit: ageLimit.trim(),
      groupSize: groupSize.trim(),
      bestSeason: bestSeason.trim(),
      heroImage: heroImage.trim(),
      isLive: isLiveImmediately,
      highlights: highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      inclusions: inclusionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      exclusions: exclusionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      departureCities: departureCities.filter((c) => c.city.trim()),
      itinerary,
      thingsToCarry,
      gallery: [heroImage.trim()],
      batches: [
        {
          month: 'Upcoming Batches',
          dates: ['Every Friday & Saturday', 'Custom Group Slots Available'],
          status: 'Filling Fast',
        },
      ],
      rating: 4.9,
      reviewsCount: 1,
    };

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTripPayload),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setSuccessMessage(`Expedition "${data.data.title}" successfully created and added to RoamX!`);
        onSuccess(data.data);
      } else {
        setErrorMessage(data.error || 'Failed to create trip.');
      }
    } catch (err: any) {
      console.error('Failed to create trip', err);
      setErrorMessage(err.message || 'Network error while creating trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Alert */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
        <Mountain className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-emerald-900">Add New Himalayan Expedition Builder</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Fill out the expedition details, custom departure city pricing, and day-by-day itinerary. Once saved, it will be published to RoamX expeditions catalog instantly.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Core Details & Hero Cover */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#FF6B35]" />
          <span>1. Core Expedition Identity & Hero Banner</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Expedition Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kuari Pass Winter Trek"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#004E64] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Region / Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Garhwal, Uttarakhand"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#004E64] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Catchy Tagline / One-Liner</label>
          <input
            type="text"
            placeholder="e.g. Walk the legendary Curzon trail with uninterrupted views of Nanda Devi & Dronagiri"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#004E64] focus:outline-none"
          />
        </div>

        {/* Hero Cover Image Input */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Hero Cover Image (URL or Upload from Device)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-8">
              <input
                type="text"
                placeholder="Paste direct image URL (Unsplash, Cloudinary, etc.)"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4 flex items-center gap-2">
              <label className="flex-1 cursor-pointer bg-blue-50 hover:bg-blue-100 text-[#004E64] text-xs font-bold py-2 px-3 rounded-xl border border-blue-200 text-center flex items-center justify-center gap-1.5 transition-colors">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {heroImage && (
            <div className="mt-3 relative rounded-xl overflow-hidden aspect-21/9 max-h-48 border border-gray-200 shadow-xs">
              <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                Hero Image Preview
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Metrics & Badges */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#004E64]" />
          <span>2. Expedition Metrics & Age Limit</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Starting Price (₹) *</label>
            <input
              type="number"
              required
              min={1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Original / Slash Price (₹)</label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value) || 0)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Duration *</label>
            <input
              type="text"
              required
              placeholder="e.g. 5 Days / 4 Nights"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Max Altitude</label>
            <input
              type="text"
              placeholder="e.g. 12,500 ft"
              value={maxAltitude}
              onChange={(e) => setMaxAltitude(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Trek Difficulty / Grade</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Trip['difficulty'])}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Easy to Moderate">Easy to Moderate</option>
              <option value="Moderate">Moderate</option>
              <option value="Moderate to Difficult">Moderate to Difficult</option>
              <option value="Difficult">Difficult</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Age Limit Eligibility</label>
            <input
              type="text"
              placeholder="e.g. 18 to 35 Years"
              value={ageLimit}
              onChange={(e) => setAgeLimit(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Group Size</label>
            <input
              type="text"
              placeholder="e.g. 12-18 Trekkers"
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Best Season</label>
            <input
              type="text"
              placeholder="e.g. Oct to April"
              value={bestSeason}
              onChange={(e) => setBestSeason(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 p-2 bg-blue-50/70 border border-blue-200 rounded-xl w-full cursor-pointer">
              <input
                type="checkbox"
                checked={isLiveImmediately}
                onChange={(e) => setIsLiveImmediately(e.target.checked)}
                className="w-4 h-4 text-[#004E64] rounded"
              />
              <span className="text-xs font-bold text-gray-900">
                Set as Default Live Trip on Homepage
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Departure Cities & Custom Pricing */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#004E64]" />
              <span>3. Departure Cities & Flexible Pricing</span>
            </h3>
            <p className="text-xs text-gray-500">
              Users can select these departure hubs on the live booking card.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddCity}
            className="text-xs font-bold bg-blue-50 text-[#004E64] hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add City</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {departureCities.map((c, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2"
            >
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="City Name (e.g. Mumbai)"
                  value={c.city}
                  onChange={(e) => handleCityChange(idx, 'city', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
                />
              </div>
              <div className="w-28">
                <input
                  type="number"
                  placeholder="Price"
                  value={c.price}
                  onChange={(e) => handleCityChange(idx, 'price', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCity(idx)}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Remove City"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Inclusions, Exclusions & Highlights */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <ListPlus className="w-4 h-4 text-[#FF6B35]" />
          <span>4. Highlights, Inclusions & Exclusions (One Per Line)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Key Highlights</label>
            <textarea
              rows={5}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder="360 Summit Panoramas&#10;Starlit Snow Camps&#10;Certified Trek Leaders"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">What's Included</label>
            <textarea
              rows={5}
              value={inclusionsText}
              onChange={(e) => setInclusionsText(e.target.value)}
              placeholder="All trail meals&#10;Alpine tents&#10;Safety equipment"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">What's Excluded</label>
            <textarea
              rows={5}
              value={exclusionsText}
              onChange={(e) => setExclusionsText(e.target.value)}
              placeholder="Offloading charges&#10;Personal gear&#10;Travel insurance"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5. Day-by-Day Detailed Itinerary Builder */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <ItineraryBuilder
          itinerary={itinerary}
          onChange={setItinerary}
        />
      </div>

      {/* 6. Gear Checklist Builder (Things to Pack & Carry) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <GearChecklistBuilder
          categories={thingsToCarry}
          onChange={setThingsToCarry}
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="py-3 px-8 bg-[#FF6B35] hover:bg-[#e05624] disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Publish Expedition to RoamX</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
