import React, { useState, useEffect } from 'react';
import {
  Star,
  ChevronDown,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  ThumbsUp,
  Camera,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Heart,
  Filter,
  Maximize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trip, Review } from '../types';

// Deterministic First-Letter Fallback Avatar Component
export const TrekkerAvatar: React.FC<{
  name: string;
  avatar?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ name, avatar, className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const initial = (name?.trim().charAt(0) || 'E').toUpperCase();

  const colorPalette = [
    'bg-[#004E64] text-white',
    'bg-[#FF6B35] text-white',
    'bg-emerald-600 text-white',
    'bg-indigo-600 text-white',
    'bg-amber-600 text-white',
    'bg-teal-600 text-white',
    'bg-rose-600 text-white',
    'bg-purple-600 text-white',
    'bg-cyan-700 text-white',
  ];
  const colorIndex = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorPalette.length;
  const chosenColor = colorPalette[colorIndex];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-11 h-11 text-sm font-black',
    lg: 'w-16 h-16 text-xl font-black',
  }[size];

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClasses} rounded-full object-cover border-2 border-white shadow-xs shrink-0 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full ${chosenColor} flex items-center justify-center border-2 border-white shadow-xs shrink-0 tracking-wider select-none font-bold ${className}`}
      title={name}
    >
      {initial}
    </div>
  );
};

interface ReviewsSectionProps {
  trip: Trip;
  allTrips?: Trip[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ trip, allTrips = [] }) => {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'photos'>('reviews');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Review composer modal state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState(trip.id);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<{ url: string; title?: string; author: string } | null>(null);

  // Fetch reviews from the API; local browser content is never a source of truth.
  useEffect(() => {
    const loadReviews = () => {
      fetch('/api/reviews')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setReviewsList(data.data);
          } else {
            setReviewsError(data.error || 'Unable to load reviews.');
          }
        })
        .catch(() => setReviewsError('Unable to load reviews from the API.'))
        .finally(() => setIsReviewsLoading(false));
    };

    loadReviews();

    // Listen for admin review delete events
    const handleReviewDeleted = (e: any) => {
      const deletedId = e.detail?.reviewId;
      if (deletedId) {
        setReviewsList((prev) => prev.filter((r) => r.id !== deletedId));
      } else {
        loadReviews();
      }
    };

    window.addEventListener('roamx_review_deleted', handleReviewDeleted);
    window.addEventListener('storage', loadReviews);

    return () => {
      window.removeEventListener('roamx_review_deleted', handleReviewDeleted);
      window.removeEventListener('storage', loadReviews);
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Filter reviews
  const filteredReviews = reviewsList.filter((r) => {
    const matchesTrip = true; // show all trekker reviews or prioritized by trip
    const matchesStar = starFilter === 'all' ? true : r.rating === starFilter;
    return matchesTrip && matchesStar;
  });

  // Calculate dynamic rating statistics
  const currentTotalReviews = reviewsList.length;
  const currentAvgRating = currentTotalReviews > 0
    ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / currentTotalReviews).toFixed(1)
    : '0.0';

  // Collect all photos from all reviews
  const allReviewPhotos = reviewsList.flatMap((r) =>
    (r.images || []).map((imgUrl) => ({
      url: imgUrl,
      author: r.name,
      city: r.city,
      tripName: r.tripName,
      date: r.date,
      rating: r.rating,
      comment: r.comment,
    }))
  );

  // Handle Avatar file upload (Optional)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP) for your profile picture.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setNewAvatar(null);
  };

  // Handle file upload for review trek photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setUploadedPhotos((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle URL photo add
  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setUploadedPhotos((prev) => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit reviews through the API only.
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    const chosenTrip = allTrips.find((t) => t.id === selectedTripId) || trip;

    const reviewPayload = {
      name: newName.trim(),
      city: newCity.trim() || 'India',
      rating: newRating,
      title: newTitle.trim() || undefined,
      comment: newComment.trim(),
      images: uploadedPhotos,
      tripId: chosenTrip.id,
      tripName: chosenTrip.title,
      avatar: newAvatar || undefined,
    };

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });

      const resData = await response.json();
      if (!resData.success || !resData.data) {
        throw new Error(resData.error || 'Failed to publish review.');
      }
      const createdReview: Review = resData.data;

      setReviewsList((prev) => {
        const updated = [createdReview, ...prev.filter((r) => r.id !== createdReview.id)];
        return updated;
      });

      setShowSuccessToast(true);
      setIsWriteModalOpen(false);

      // Reset form
      setNewName('');
      setNewCity('');
      setNewTitle('');
      setNewComment('');
      setNewAvatar(null);
      setUploadedPhotos([]);
      setNewRating(5);

      // Confetti celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => setShowSuccessToast(false), 5000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(err instanceof Error ? err.message : 'Failed to publish review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    5: '🌟 5.0 - Exceptional! Exceeded all mountain expectations',
    4: '✨ 4.0 - Very Good! Thoroughly enjoyed the expedition',
    3: '👍 3.0 - Good Experience with solid logistics',
    2: '😐 2.0 - Fair, needs some improvements',
    1: '👎 1.0 - Dissatisfied with the trek experience',
  };

  return (
    <section id="reviews-section" className="py-14 bg-[#F8F9FA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Review & Photos Published!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you for sharing your mountain story with the RoamX community.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-emerald-800 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Ratings Summary Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-8">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-4xl sm:text-5xl font-black text-gray-900">{currentAvgRating}</span>
                <div className="space-y-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 font-bold">
                    {currentTotalReviews} Verified Community Reviews
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {currentTotalReviews > 0
                  ? 'Based on published RoamX community reviews.'
                  : 'Published community ratings will appear here.'}
              </p>
            </div>

            <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Safety</div>
                <div className="text-base font-bold text-[#004E64]">{currentAvgRating} / 5.0</div>
              </div>
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Leads</div>
                <div className="text-base font-bold text-[#004E64]">{currentAvgRating} / 5.0</div>
              </div>
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Food</div>
                <div className="text-base font-bold text-[#004E64]">{currentAvgRating} / 5.0</div>
              </div>
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Vibe</div>
                <div className="text-base font-bold text-[#004E64]">{currentAvgRating} / 5.0</div>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center">
              <button
                id="write-review-open-btn"
                onClick={() => setIsWriteModalOpen(true)}
                className="w-full sm:w-auto py-3 px-5 bg-gradient-to-r from-[#FF6B35] to-[#f25820] hover:from-[#f25820] hover:to-[#e04812] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Write Review & Add Photos</span>
              </button>
              <span className="text-[11px] text-gray-400 mt-1.5 text-center">
                Share photos & earn trek credits
              </span>
            </div>

          </div>
        </div>

        {/* Interactive Tabs: Ratings & Reviews Tab vs. Trekker Photos Tab */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              id="tab-all-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#004E64] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Trekker Reviews & Ratings ({reviewsList.length})</span>
            </button>

            <button
              id="tab-photo-gallery"
              onClick={() => setActiveTab('photos')}
              className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-[#004E64] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Trekker Photos ({allReviewPhotos.length})</span>
            </button>
          </div>

          {/* Star Filter Chips (Visible when Reviews Tab is active) */}
          {activeTab === 'reviews' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-gray-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Filter:</span>
              </span>

              <button
                onClick={() => setStarFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  starFilter === 'all'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Stars
              </button>

              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  onClick={() => setStarFilter(star)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    starFilter === star
                      ? 'bg-[#FF6B35] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB CONTENT 1: Reviews Grid */}
        {activeTab === 'reviews' && (
          <div className="mb-14">
            {isReviewsLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="text-sm text-gray-500">Loading reviews...</p>
              </div>
            ) : reviewsError ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="text-sm text-gray-500">{reviewsError}</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <p className="text-sm text-gray-500">
                  {starFilter === 'all' ? 'No reviews available yet.' : 'No reviews found matching the selected star filter.'}
                </p>
                <button
                  onClick={() => setStarFilter('all')}
                  className="mt-3 text-xs font-bold text-[#004E64] hover:underline"
                >
                  View All Reviews
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <TrekkerAvatar name={rev.name} avatar={rev.avatar} />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-gray-900">{rev.name}</h4>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500">
                              {rev.city} • {rev.tripName}
                            </span>
                          </div>
                        </div>

                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h5 className="font-bold text-sm text-gray-900 leading-snug">
                          "{rev.title}"
                        </h5>
                      )}

                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>

                      {/* Review Photos Thumbnails */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                            Photos from this trek ({rev.images.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {rev.images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setActivePhotoModal({
                                    url: img,
                                    title: rev.title,
                                    author: rev.name,
                                  })
                                }
                                className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                              >
                                <img
                                  src={img}
                                  alt={`Trek photo by ${rev.name}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                  <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-medium text-[#004E64]">{rev.tripName}</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 2: Trekker Photo Gallery */}
        {activeTab === 'photos' && (
          <div className="mb-14">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allReviewPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhotoModal(photo)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt={`Photo by ${photo.author}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white">
                    <div className="flex justify-end">
                      <span className="bg-black/50 p-1.5 rounded-full backdrop-blur-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div>
                      <div className="flex text-amber-400 mb-0.5">
                        {[...Array(photo.rating)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                        ))}
                      </div>
                      <div className="text-xs font-bold leading-tight">{photo.author}</div>
                      <div className="text-[10px] text-gray-300 truncate">{photo.tripName}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Asked Questions */}
        <div>
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Need Answers?
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#004E64]" />
              <span>Frequently Asked Questions</span>
            </h3>
          </div>

          <div className="space-y-3">
            {trip.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-sm text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#004E64]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-[#F8F9FA]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODAL: Write a Review & Send Review Images */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl rounded-none shadow-2xl border-0 sm:border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#004E64] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Write a Trek Review & Rating</h3>
                  <p className="text-xs text-blue-100">
                    Share your genuine mountain experience with fellow trekkers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitReview} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Star Rating Picker */}
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2 text-center">
                <label className="text-xs font-bold text-gray-700 block">
                  Select Your Overall Expedition Rating
                </label>
                
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          (hoverRating || newRating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-xs font-bold text-[#FF6B35]">
                  {ratingDescriptions[hoverRating || newRating]}
                </div>
              </div>

              {/* Trip Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Which Expedition Did You Trek?
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-[#004E64] focus:outline-none"
                >
                  {(allTrips.length > 0 ? allTrips : [trip]).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.duration})
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Profile Picture (DP) Upload */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TrekkerAvatar
                      name={newName || 'Trekker'}
                      avatar={newAvatar || undefined}
                      size="md"
                      className="ring-2 ring-white shadow-xs"
                    />
                    <div>
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer">
                        <span>Profile Picture</span>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full">
                          Optional
                        </span>
                      </label>
                      <p className="text-[11px] text-gray-500">
                        {newAvatar
                          ? 'Custom photo uploaded'
                          : `Default avatar: Initial "${(newName?.trim().charAt(0) || 'T').toUpperCase()}"`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 shadow-2xs hover:border-[#004E64] transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#004E64]" />
                      <span>{newAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {newAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove uploaded photo (use letter avatar)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-[#004E64] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-[#004E64] focus:outline-none"
                  />
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Headline / Review Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unforgettable 3 AM summit push & great trek captain!"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-[#004E64] focus:outline-none"
                />
              </div>

              {/* Detailed Comment */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Trek Experience & Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="How were the trail leaders, basecamp food, campsite safety, and equipment?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-gray-900 focus:ring-2 focus:ring-[#004E64] focus:outline-none"
                />
              </div>

              {/* Photos Uploader */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#004E64]" />
                    <span>Upload Trek Photos / Images</span>
                  </span>
                  <span className="text-[11px] font-normal text-gray-400">
                    PNG, JPG or WebP
                  </span>
                </label>

                {/* Upload Action Box */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 border-2 border-dashed border-gray-300 hover:border-[#004E64] bg-gray-50 hover:bg-blue-50/50 p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-semibold text-gray-600">
                    <Upload className="w-4 h-4 text-[#004E64]" />
                    <span>Choose Photos from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex gap-1">
                    <input
                      type="url"
                      placeholder="Or paste photo URL"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="text-xs bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1.5 w-36 text-gray-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Photo Previews */}
                {uploadedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {uploadedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-2xs group"
                      >
                        <img
                          src={photo}
                          alt={`Uploaded preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#004E64] hover:bg-[#003d4d] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publish Review & Photos</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL: View Single Trekker Photo */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-3 right-3 z-10 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={activePhotoModal.url}
              alt="Full size trekker photograph"
              className="w-full max-h-[75vh] object-contain bg-black"
            />

            <div className="p-4 bg-gray-900 text-white flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-sm block">{activePhotoModal.author}</span>
                <span className="text-gray-400">{activePhotoModal.title || 'RoamX Mountain Trek'}</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Verified Trekker Photo
              </span>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
