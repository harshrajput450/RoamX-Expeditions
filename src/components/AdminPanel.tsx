import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Radio,
  Plus,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Edit3,
  DollarSign,
  Users,
  Eye,
  RefreshCw,
  Phone,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Link as LinkIcon,
  ShieldCheck,
  Clock,
  Mountain,
  Compass,
  MapPin,
  CreditCard,
  QrCode,
  Award,
  Star,
  ListPlus,
} from 'lucide-react';
import { AnnouncementStrip, BookingInquiry, DepartureCity, Trip, ItineraryDay } from '../types';
import { AddExpeditionForm } from './AddExpeditionForm';
import { ItineraryBuilder } from './ItineraryBuilder';
import { GearChecklistBuilder } from './GearChecklistBuilder';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: AnnouncementStrip[];
  onToggleActiveBanner: (id: string) => Promise<void>;
  onCreateBanner: (banner: Partial<AnnouncementStrip>) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
  activeTrip: Trip;
  allTrips?: Trip[];
  onSelectTrip?: (tripId: string) => void;
  onSetLiveTrip?: (tripId: string) => Promise<void>;
  onSetHeroImage?: (tripId: string, imageUrl: string) => Promise<void>;
  onCreateTrip?: (trip: Trip) => void;
  onUpdateTrip: (updatedTrip: Partial<Trip>) => Promise<void>;
  onDeleteTrip?: (tripId: string) => Promise<void>;
  onDuplicateTrip?: (tripId: string) => Promise<void>;
  onUploadImage: (imageUrl: string, makeHero: boolean) => Promise<void>;
  onDeleteGalleryImage?: (imageUrl: string, tripId?: string) => Promise<void>;
  inquiries: BookingInquiry[];
  onUpdateInquiryStatus: (id: string, status: BookingInquiry['status']) => Promise<void>;
  adminEmail?: string;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  announcements,
  onToggleActiveBanner,
  onCreateBanner,
  onDeleteBanner,
  activeTrip,
  allTrips,
  onSelectTrip,
  onSetLiveTrip,
  onSetHeroImage,
  onCreateTrip,
  onUpdateTrip,
  onDeleteTrip,
  onDuplicateTrip,
  onUploadImage,
  onDeleteGalleryImage,
  inquiries,
  onUpdateInquiryStatus,
  adminEmail = 'harsh_cse24@delhitechnicalcampus.ac.in',
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'banners' | 'images' | 'trip-details' | 'add-trip' | 'inquiries' | 'reviews'>('banners');
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [reviewToDelete, setReviewToDelete] = useState<any | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [isSettingLive, setIsSettingLive] = useState(false);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);
  const [isDuplicatingTrip, setIsDuplicatingTrip] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load reviews for moderation
  useEffect(() => {
    if (isOpen) {
      fetch('/api/reviews')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setAdminReviews(data.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeletingReview(true);
    try {
      const res = await fetch(`/api/reviews/${reviewToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAdminReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
        
        // Dispatch real-time custom event across applet tabs and components
        window.dispatchEvent(new CustomEvent('roamx_review_deleted', { detail: { reviewId: reviewToDelete.id } }));
        window.dispatchEvent(new Event('storage'));
        setReviewToDelete(null);
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Failed to delete review', err);
      alert('An error occurred while deleting the review');
    } finally {
      setIsDeletingReview(false);
    }
  };

  const handleDeleteReviewImage = async (reviewId: string, imageIndex: number) => {
    if (window.confirm('Delete this photo from the review?')) {
      try {
        const res = await fetch(`/api/reviews/${reviewId}/images/${imageIndex}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success && data.data) {
          setAdminReviews((prev) =>
            prev.map((r) => (r.id === reviewId ? data.data : r))
          );
        }
      } catch (err) {
        console.error('Failed to delete review photo', err);
      }
    }
  };

  const handleDeleteGalleryImage = async (imgUrlToDelete: string) => {
    if (!window.confirm('Are you sure you want to delete this photo from the expedition gallery?')) {
      return;
    }

    // 1. Optimistically compute updated gallery & hero
    const updatedGallery = (activeTrip.gallery || []).filter((img) => img !== imgUrlToDelete);
    const newHero = activeTrip.heroImage === imgUrlToDelete ? (updatedGallery[0] || '') : activeTrip.heroImage;

    // Instantly update active trip in local state
    onUpdateTrip({ gallery: updatedGallery, heroImage: newHero });

    try {
      if (onDeleteGalleryImage) {
        await onDeleteGalleryImage(imgUrlToDelete, activeTrip.id);
      } else {
        const res = await fetch(`/api/trips/${activeTrip.id}/gallery`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: imgUrlToDelete }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          onUpdateTrip(data.data);
        }
      }
      showToast('Photo deleted from expedition gallery.');
    } catch (err) {
      console.error('Failed to delete gallery image', err);
      showToast('Photo removed from expedition gallery.');
    }
  };

  // New Banner Form State
  const [newText, setNewText] = useState('');
  const [newLink, setNewLink] = useState('#booking-section');
  const [newBadge, setNewBadge] = useState('FLASH SALE');
  const [newIsActive, setNewIsActive] = useState(false);
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);

  // Image Upload Form State
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [makeHeroOnUpload, setMakeHeroOnUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Trip Edit Form State - Expedition Snapshot & General
  const [editTitle, setEditTitle] = useState(activeTrip.title);
  const [editTagline, setEditTagline] = useState(activeTrip.tagline);
  const [editLocation, setEditLocation] = useState(activeTrip.location);
  const [editPrice, setEditPrice] = useState(activeTrip.price);
  const [editOriginalPrice, setEditOriginalPrice] = useState(activeTrip.originalPrice || activeTrip.price + 3000);
  const [editTotalSeats, setEditTotalSeats] = useState(activeTrip.totalSeats || 20);
  const [editBookedSeats, setEditBookedSeats] = useState(activeTrip.bookedSeats || 0);
  const [editIsFeatured, setEditIsFeatured] = useState(Boolean(activeTrip.isFeatured || (activeTrip as any).is_featured));
  const [editDifficulty, setEditDifficulty] = useState<Trip['difficulty']>(activeTrip.difficulty);
  const [editDuration, setEditDuration] = useState(activeTrip.duration);
  const [editMaxAltitude, setEditMaxAltitude] = useState(activeTrip.maxAltitude);
  const [editAgeLimit, setEditAgeLimit] = useState(activeTrip.ageLimit);
  const [editGroupSize, setEditGroupSize] = useState(activeTrip.groupSize);
  const [editBestSeason, setEditBestSeason] = useState(activeTrip.bestSeason);
  const [editHighlightsText, setEditHighlightsText] = useState((activeTrip.highlights || []).join('\n'));
  const [editInclusionsText, setEditInclusionsText] = useState((activeTrip.inclusions || []).join('\n'));
  const [editExclusionsText, setEditExclusionsText] = useState((activeTrip.exclusions || []).join('\n'));
  const [editDepartureCities, setEditDepartureCities] = useState<DepartureCity[]>(activeTrip.departureCities || []);
  const [editItinerary, setEditItinerary] = useState<ItineraryDay[]>(activeTrip.itinerary || []);
  const [editThingsToCarry, setEditThingsToCarry] = useState<{ category: string; items: string[] }[]>(
    activeTrip.thingsToCarry || activeTrip.packingList || []
  );

  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [tripSaveSuccess, setTripSaveSuccess] = useState(false);

  // Synchronize form states when activeTrip changes or panel opens
  useEffect(() => {
    if (activeTrip) {
      setEditTitle(activeTrip.title || '');
      setEditTagline(activeTrip.tagline || '');
      setEditLocation(activeTrip.location || '');
      setEditPrice(activeTrip.price || 0);
      setEditOriginalPrice(activeTrip.originalPrice || (activeTrip.price ? activeTrip.price + 3000 : 0));
      setEditTotalSeats(activeTrip.totalSeats || 20);
      setEditBookedSeats(activeTrip.bookedSeats || 0);
      setEditIsFeatured(Boolean(activeTrip.isFeatured || (activeTrip as any).is_featured));
      setEditDifficulty(activeTrip.difficulty || 'Easy to Moderate');
      setEditDuration(activeTrip.duration || '5 Days / 4 Nights');
      setEditMaxAltitude(activeTrip.maxAltitude || '12,500 Feet (3,810 m)');
      setEditAgeLimit(activeTrip.ageLimit || '18 to 35 Years');
      setEditGroupSize(activeTrip.groupSize || '12 - 16 Trekkers per batch');
      setEditBestSeason(activeTrip.bestSeason || 'October to May');
      setEditHighlightsText((activeTrip.highlights || []).join('\n'));
      setEditInclusionsText((activeTrip.inclusions || []).join('\n'));
      setEditExclusionsText((activeTrip.exclusions || []).join('\n'));
      setEditDepartureCities(activeTrip.departureCities || []);
      setEditItinerary(activeTrip.itinerary || []);
      setEditThingsToCarry(activeTrip.thingsToCarry || activeTrip.packingList || []);
    }
  }, [activeTrip, isOpen]);

  if (!isOpen) return null;

  // Banner Creation Handler
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setIsSubmittingBanner(true);
    try {
      await onCreateBanner({
        text: newText,
        link: newLink,
        badge: newBadge,
        isActive: newIsActive,
      });
      setNewText('');
      setNewLink('#booking-section');
      setNewBadge('OFFER');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  // Image File Handling (Drag and drop or file picker)
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedFilePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = selectedFilePreview || imageUrl;
    if (!finalUrl) {
      alert('Please select a file or paste an image URL');
      return;
    }

    setIsUploading(true);
    try {
      await onUploadImage(finalUrl, makeHeroOnUpload);
      setSelectedFilePreview(null);
      setImageUrl('');
      setMakeHeroOnUpload(false);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Trip Info Save Handler
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTrip(true);
    try {
      await onUpdateTrip({
        title: editTitle,
        tagline: editTagline,
        location: editLocation,
        price: Number(editPrice),
        originalPrice: Number(editOriginalPrice) || undefined,
        totalSeats: Number(editTotalSeats),
        bookedSeats: Number(editBookedSeats),
        isFeatured: editIsFeatured,
        is_featured: editIsFeatured,
        difficulty: editDifficulty,
        duration: editDuration,
        maxAltitude: editMaxAltitude,
        ageLimit: editAgeLimit,
        groupSize: editGroupSize,
        bestSeason: editBestSeason,
        highlights: editHighlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
        inclusions: editInclusionsText.split('\n').map((s) => s.trim()).filter(Boolean),
        exclusions: editExclusionsText.split('\n').map((s) => s.trim()).filter(Boolean),
        departureCities: editDepartureCities,
        itinerary: editItinerary,
        thingsToCarry: editThingsToCarry,
      });
      setTripSaveSuccess(true);
      setTimeout(() => setTripSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTrip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#004E64] text-white px-6 py-4 flex items-center justify-between border-b border-[#003d4d] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white font-black text-sm tracking-tight shadow-sm">
              RX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">RoamX Admin Section</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Owner Mode
                </span>
              </div>
              <p className="text-xs text-blue-100 truncate max-w-xs sm:max-w-md">
                Logged in as: <strong className="text-white">{adminEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-[11px] font-bold bg-white/10 hover:bg-rose-600/30 text-rose-100 hover:text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
                title="Log out of Admin Session"
              >
                Log Out
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Sticky Sub-Header Bar) */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 flex flex-wrap items-center gap-1 sm:gap-2 shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('banners')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'banners'
                ? 'border-[#004E64] text-[#004E64] bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Radio className="w-4 h-4 text-[#004E64]" />
            <span>Live Announcement Strips</span>
            <span className="bg-blue-100 text-[#004E64] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {announcements.filter((a) => a.isActive).length} Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trip-details')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'trip-details'
                ? 'border-[#004E64] text-[#004E64] bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-4 h-4 text-[#004E64]" />
            <span>Expedition Snapshot & Details</span>
          </button>

          <button
            onClick={() => setActiveTab('add-trip')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'add-trip'
                ? 'border-[#FF6B35] text-[#FF6B35] bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4 text-[#FF6B35]" />
            <span>Add New Expedition</span>
            <span className="bg-orange-100 text-[#FF6B35] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Builder
            </span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'images'
                ? 'border-[#004E64] text-[#004E64] bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#004E64]" />
            <span>Image & Hero Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'inquiries'
                ? 'border-[#004E64] text-[#004E64] bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 text-[#004E64]" />
            <span>Booking Inquiries</span>
            <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {inquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#004E64] text-[#004E64] bg-white shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Reviews & Ratings ({adminReviews.length})</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Live Announcement Strips Control */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              
              {/* Single Active Strip Rule Callout */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-gray-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#004E64] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#004E64]">
                    Single Active Banner Guarantee Enforced
                  </h4>
                  <p className="text-gray-700 mt-0.5 leading-relaxed">
                    Selecting any radio toggle calls <code className="bg-blue-100 text-[#004E64] px-1 py-0.5 rounded font-mono text-[11px]">PATCH /api/announcements/:id/toggle</code> on the backend. This guarantees that when one banner is set to <strong>isActive = true</strong>, all other banners automatically flip to <strong>isActive = false</strong>.
                  </p>
                </div>
              </div>

              {/* Banners List & Toggle Controls */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-[#F8F9FA] border-b border-gray-200 font-bold text-xs text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Available Announcement Strips</span>
                  <span className="text-[11px] font-normal text-gray-500">Click radio or switch to make active</span>
                </div>

                <div className="divide-y divide-gray-200">
                  {announcements.map((banner) => (
                    <div
                      key={banner.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        banner.isActive ? 'bg-orange-50/40' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {/* Radio Switch for Single Active Rule */}
                        <button
                          type="button"
                          onClick={() => onToggleActiveBanner(banner.id)}
                          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                            banner.isActive
                              ? 'border-[#004E64] bg-[#004E64] text-white shadow-xs'
                              : 'border-gray-300 hover:border-[#004E64] bg-white'
                          }`}
                          title={banner.isActive ? 'Active Live Banner' : 'Click to Set as Live Banner'}
                        >
                          {banner.isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {banner.badge && (
                              <span className="text-[10px] font-bold uppercase bg-orange-100 text-[#FF6B35] px-2 py-0.5 rounded">
                                {banner.badge}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                banner.isActive
                                  ? 'bg-blue-100 text-[#004E64] border border-blue-200'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {banner.isActive ? '● LIVE ON WEBSITE' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">
                            {banner.text}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                            <LinkIcon className="w-3 h-3 text-gray-400" />
                            <span>Link Target: {banner.link}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {!banner.isActive && (
                          <button
                            onClick={() => onToggleActiveBanner(banner.id)}
                            className="text-xs font-bold bg-blue-50 text-[#004E64] hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Set Live
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteBanner(banner.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Announcement Form */}
              <div className="bg-[#F8F9FA] rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#004E64]" />
                  <span>Create New Announcement Strip</span>
                </h3>

                <form onSubmit={handleCreateBanner} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Banner Announcement Text *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 🔥 FLAT ₹1,500 CASHBACK ON ALL SPITI 4X4 BATCHES THIS WEEK!"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Badge Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. FLASH SALE, NEW YEAR"
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Action Link / Anchor</label>
                      <input
                        type="text"
                        placeholder="#booking-section"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg w-full cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newIsActive}
                          onChange={(e) => setNewIsActive(e.target.checked)}
                          className="w-4 h-4 text-[#004E64] rounded"
                        />
                        <span className="text-xs font-bold text-gray-700">Make Live Immediately</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingBanner}
                    className="py-2.5 px-4 bg-[#004E64] hover:bg-[#003d4d] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Announcement Banner</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: Image Management */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              
              {/* Image Upload Zone */}
              <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#004E64]" />
                      <span>Upload & Replace Trip Images (Cloudinary / Direct Ready)</span>
                    </h3>
                    <p className="text-xs text-gray-500">Supports drag-and-drop, local file picking, and direct image URLs.</p>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageInputMode === 'file' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageInputMode === 'url' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {imageInputMode === 'file' ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-[#004E64] bg-blue-50/50'
                          : 'border-gray-300 hover:border-[#004E64] bg-white'
                      }`}
                      onClick={() => document.getElementById('admin-file-picker')?.click()}
                    >
                      <input
                        id="admin-file-picker"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                      />

                      {selectedFilePreview ? (
                        <div className="space-y-3">
                          <img
                            src={selectedFilePreview}
                            alt="Upload preview"
                            className="max-h-48 mx-auto rounded-lg shadow-md object-cover"
                          />
                          <p className="text-xs font-bold text-[#004E64]">Image selected! Ready to upload.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadCloud className="w-10 h-10 text-[#004E64] mx-auto" />
                          <p className="text-xs font-bold text-gray-700">
                            Drag and drop your high-resolution expedition photo here
                          </p>
                          <p className="text-[11px] text-gray-400">or click to browse local files (PNG, JPG, WebP)</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setSelectedFilePreview(e.target.value);
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={makeHeroOnUpload}
                        onChange={(e) => setMakeHeroOnUpload(e.target.checked)}
                        className="w-4 h-4 text-[#004E64] rounded"
                      />
                      <span>Set as Trip Hero / Cover Photo immediately</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="py-2 px-5 bg-[#004E64] hover:bg-[#003d4d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>Save & Add to Expedition Gallery</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Hero & Gallery Overview */}
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">
                  Current Gallery Images for {activeTrip.title}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Hero Image Card */}
                  <div className="relative rounded-xl overflow-hidden border-2 border-[#004E64] shadow-md group aspect-4/3">
                    <img
                      src={activeTrip.heroImage}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-[#004E64] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">
                      CURRENT HERO
                    </span>
                    {activeTrip.gallery && activeTrip.gallery.length > 1 && (
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                        <span className="text-[11px] font-bold text-white text-center">Featured Cover Photo</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryImage(activeTrip.heroImage)}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Photo</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gallery Items */}
                  {activeTrip.gallery
                    .filter((img) => img !== activeTrip.heroImage)
                    .map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-4/3"
                      >
                        <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (onSetHeroImage) {
                                await onSetHeroImage(activeTrip.id, imgUrl);
                              } else {
                                await onUpdateTrip({ heroImage: imgUrl });
                              }
                              showToast('Hero cover photo set and saved!');
                            }}
                            className="w-full bg-[#004E64] hover:bg-[#003d4d] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow cursor-pointer text-center"
                          >
                            Set as Hero
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImage(imgUrl)}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Photo</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Expedition Snapshot & Details */}
          {activeTab === 'trip-details' && (
            <form onSubmit={handleSaveTrip} className="space-y-6">
              
              {/* Trip Switcher & Live Status Header */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                  {allTrips && allTrips.length > 1 && (
                    <div className="flex-1 max-w-xs">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Select Expedition to Edit:
                      </label>
                      <select
                        value={activeTrip.id}
                        onChange={(e) => onSelectTrip && onSelectTrip(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004E64]"
                      >
                        {allTrips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} {t.isLive ? '★ (Live on Homepage)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      Active: <strong className="text-[#004E64]">{activeTrip.title}</strong>
                    </span>
                    <span className="text-[11px] text-gray-500">
                      ID: <code>{activeTrip.id}</code>
                    </span>
                  </div>
                </div>

                {/* Action Controls: Live, Duplicate, Delete */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Duplicate Batch Button */}
                  {onDuplicateTrip && (
                    <button
                      type="button"
                      disabled={isDuplicatingTrip}
                      onClick={async () => {
                        setIsDuplicatingTrip(true);
                        try {
                          await onDuplicateTrip(activeTrip.id);
                          showToast(`Duplicated "${activeTrip.title}" as new custom batch!`);
                        } catch (err: any) {
                          alert(err.message || 'Failed to duplicate trip');
                        } finally {
                          setIsDuplicatingTrip(false);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-300 transition-colors cursor-pointer"
                      title="Duplicate as new editable batch"
                    >
                      {isDuplicatingTrip ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#004E64]" />
                      )}
                      <span>Duplicate Batch</span>
                    </button>
                  )}

                  {/* Delete Trip Button */}
                  {onDeleteTrip && allTrips && allTrips.length > 1 && (
                    <button
                      type="button"
                      disabled={isDeletingTrip}
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Are you sure you want to permanently delete "${activeTrip.title}"? This action cannot be undone.`
                          )
                        ) {
                          setIsDeletingTrip(true);
                          try {
                            await onDeleteTrip(activeTrip.id);
                            showToast(`Expedition "${activeTrip.title}" deleted.`);
                          } catch (err: any) {
                            alert(err.message || 'Failed to delete trip');
                          } finally {
                            setIsDeletingTrip(false);
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      title="Delete this expedition from database"
                    >
                      {isDeletingTrip ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>Delete Expedition</span>
                    </button>
                  )}

                  {/* Set as Live Homepage Expedition Button */}
                  {activeTrip.isLive ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>🟢 Live on Homepage</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isSettingLive}
                      onClick={async () => {
                        if (onSetLiveTrip) {
                          setIsSettingLive(true);
                          try {
                            await onSetLiveTrip(activeTrip.id);
                            showToast(`"${activeTrip.title}" is now the Live Featured Expedition on RoamX!`);
                          } finally {
                            setIsSettingLive(false);
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#004E64] hover:bg-[#003d4d] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      {isSettingLive ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Radio className="w-3.5 h-3.5 text-cyan-300" />
                      )}
                      <span>Set as Live on Homepage</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1. EXPEDITION SNAPSHOT (The 4 Badges & Grade as displayed on public site) */}
              <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FF6B35]" />
                    <h3 className="font-bold text-sm text-gray-900">
                      Expedition Snapshot Metrics
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-[#FF6B35] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Live On Homepage
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  These 4 essential badges and expedition grade appear directly under the "Trip Highlights & Inclusions" section.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  
                  {/* Age Eligibility */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-[#004E64]" />
                      <span>Age Eligibility</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 18 to 35 Years"
                      value={editAgeLimit}
                      onChange={(e) => setEditAgeLimit(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Displayed on Age badge (Solo & Group Friendly)</span>
                  </div>

                  {/* Trek Difficulty / Grade */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span>Grade / Trek Difficulty</span>
                    </label>
                    <select
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value as Trip['difficulty'])}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Easy to Moderate">Easy to Moderate</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Moderate to Difficult">Moderate to Difficult</option>
                      <option value="Difficult">Difficult</option>
                    </select>
                    <span className="text-[10px] text-gray-400 mt-1 block">Displayed on Grade badge & Difficulty card</span>
                  </div>

                  {/* Duration */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#004E64]" />
                      <span>Duration</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 Days / 4 Nights"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">All Nights Included indicator</span>
                  </div>

                  {/* Max Altitude */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                      <Mountain className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span>Max Altitude</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12,500 Feet (3,810 m)"
                      value={editMaxAltitude}
                      onChange={(e) => setEditMaxAltitude(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Gradual Acclimatization metric</span>
                  </div>

                  {/* Group Size */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-[#004E64]" />
                      <span>Batch Group Size</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12 - 16 Trekkers per batch"
                      value={editGroupSize}
                      onChange={(e) => setEditGroupSize(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Batch capacity guideline</span>
                  </div>

                  {/* Best Season */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                      <span>Best Season</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. October to May (Snow: Dec to Apr)"
                      value={editBestSeason}
                      onChange={(e) => setEditBestSeason(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Ideal travel window</span>
                  </div>

                </div>
              </div>

              {/* 2. GENERAL TRIP INFO & BASE PRICING */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#004E64]" />
                  <span>General Information & Base Pricing</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Trip Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Location / Circuit</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tagline & Summary</label>
                  <textarea
                    rows={2}
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Base Price (INR ₹)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Original Strike-Through Price (₹)</label>
                    <input
                      type="number"
                      value={editOriginalPrice}
                      onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                  </div>
                </div>

                {/* Seat Capacity & Hero Feature Flag */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Total Batch Capacity (Seats)</label>
                    <input
                      type="number"
                      min={1}
                      value={editTotalSeats}
                      onChange={(e) => setEditTotalSeats(Number(e.target.value))}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Max batch seats (default: 20)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Base Booked Seats</label>
                    <input
                      type="number"
                      min={0}
                      value={editBookedSeats}
                      onChange={(e) => setEditBookedSeats(Number(e.target.value))}
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64]"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">+ live confirmed inquiries</span>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2 bg-[#F8F9FA] rounded-lg border border-gray-200 cursor-pointer hover:bg-orange-50/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={editIsFeatured}
                        onChange={(e) => setEditIsFeatured(e.target.checked)}
                        className="w-4 h-4 text-[#FF6B35] rounded focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">Featured on Hero</span>
                        <span className="text-[10px] text-gray-500">Sets is_featured in DB</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. TRIP HIGHLIGHTS ("Why This Expedition Is Special") */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                    <span>Trip Highlights & Inclusions Bullets</span>
                  </h3>
                  <span className="text-[11px] text-gray-400">1 bullet per line</span>
                </div>
                <p className="text-xs text-gray-500">
                  These highlights are displayed with checkmark badges in the "Why This Expedition Is Special" container.
                </p>
                <textarea
                  rows={5}
                  value={editHighlightsText}
                  onChange={(e) => setEditHighlightsText(e.target.value)}
                  placeholder="Enter one highlight per line..."
                  className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] font-mono leading-relaxed"
                />
              </div>

              {/* 4. DEPARTURE CITIES & PRICING TABLE */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#004E64]" />
                    <span>Departure Hubs & Custom Pricing (₹)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setEditDepartureCities((prev) => [
                        ...prev,
                        { city: 'New Departure Hub', price: editPrice, note: 'Direct transfers included', isPopular: false },
                      ])
                    }
                    className="text-[11px] font-bold bg-blue-50 text-[#004E64] hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add City</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {editDepartureCities.map((cityObj, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-0.5">City Name</label>
                          <input
                            type="text"
                            value={cityObj.city}
                            onChange={(e) => {
                              const updated = [...editDepartureCities];
                              updated[idx] = { ...updated[idx], city: e.target.value };
                              setEditDepartureCities(updated);
                            }}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Price (₹)</label>
                          <input
                            type="number"
                            value={cityObj.price}
                            onChange={(e) => {
                              const updated = [...editDepartureCities];
                              updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                              setEditDepartureCities(updated);
                            }}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Transfer Note</label>
                          <input
                            type="text"
                            value={cityObj.note || ''}
                            onChange={(e) => {
                              const updated = [...editDepartureCities];
                              updated[idx] = { ...updated[idx], note: e.target.value };
                              setEditDepartureCities(updated);
                            }}
                            placeholder="e.g. AC Volvo included"
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2 sm:pt-0">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(cityObj.isPopular)}
                            onChange={(e) => {
                              const updated = [...editDepartureCities];
                              updated[idx] = { ...updated[idx], isPopular: e.target.checked };
                              setEditDepartureCities(updated);
                            }}
                            className="w-3.5 h-3.5 text-[#004E64] rounded"
                          />
                          <span>Popular</span>
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setEditDepartureCities((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Remove City"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. INCLUSIONS & EXCLUSIONS */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-[#FF6B35]" />
                  <span>Inclusions & Exclusions</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      What's Included (1 per line)
                    </label>
                    <textarea
                      rows={4}
                      value={editInclusionsText}
                      onChange={(e) => setEditInclusionsText(e.target.value)}
                      placeholder="All meals on trek&#10;High altitude dome tents&#10;Trek leader & guide"
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] font-mono leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      What's Excluded (1 per line)
                    </label>
                    <textarea
                      rows={4}
                      value={editExclusionsText}
                      onChange={(e) => setEditExclusionsText(e.target.value)}
                      placeholder="Personal trekking gear&#10;Backpack offloading&#10;Insurance"
                      className="w-full bg-[#F8F9FA] border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] font-mono leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* 6. DAY-BY-DAY ITINERARY BUILDER */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                <ItineraryBuilder
                  itinerary={editItinerary}
                  onChange={setEditItinerary}
                />
              </div>

              {/* 7. THINGS TO PACK & CARRY (GEAR CHECKLIST) BUILDER */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                <GearChecklistBuilder
                  categories={editThingsToCarry}
                  onChange={setEditThingsToCarry}
                />
              </div>

              {/* Save & Success Banner */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 pb-1 border-t border-gray-200 flex items-center justify-between gap-4">
                {tripSaveSuccess ? (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[#004E64] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#004E64]" />
                    <span>Expedition snapshot and details updated and synced live!</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">
                    Changes apply immediately to public snapshot, hero cards & pricing selector.
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSavingTrip}
                  className="py-2.5 px-6 bg-[#004E64] hover:bg-[#003d4d] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  {isSavingTrip ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
                      <span>Save Expedition Snapshot Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* TAB: Add New Expedition Builder */}
          {activeTab === 'add-trip' && (
            <AddExpeditionForm
              onSuccess={(newTrip) => {
                if (onCreateTrip) {
                  onCreateTrip(newTrip);
                }
                if (onSelectTrip) {
                  onSelectTrip(newTrip.id);
                }
                showToast(`Expedition "${newTrip.title}" successfully created and added to RoamX!`);
                setActiveTab('trip-details');
              }}
            />
          )}

          {/* TAB 4: Inquiries Inbox & Payments */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#004E64]" />
                    <span>Received Inquiries & Bookings ({inquiries.length})</span>
                  </h3>
                  <span className="text-xs text-gray-500">Live submissions, unique Booking IDs & Razorpay verified transactions</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Total Paid:</span>
                  <span className="font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {inquiries.filter((i) => i.paymentStatus?.includes('Paid') || i.paidAmount || i.status === 'Confirmed').length} Confirmed
                  </span>
                </div>
              </div>

              {inquiries.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No inquiries received yet. Submit one from the booking form!
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => {
                    const isPaid = inq.paymentStatus?.includes('Paid') || Boolean(inq.paidAmount);
                    const displayTripId = inq.tripBookingId || inq.id;

                    return (
                      <div
                        key={inq.id}
                        className={`p-4 rounded-xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isPaid
                            ? 'bg-white border-emerald-200 ring-1 ring-emerald-500/20'
                            : 'bg-[#F8F9FA] border-gray-200'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">{inq.name}</h4>
                            
                            {/* Trip ID Pill */}
                            <span className="font-mono text-xs font-black bg-[#004E64] text-white px-2 py-0.5 rounded shadow-2xs">
                              {displayTripId}
                            </span>

                            {/* Payment Status Tag */}
                            {isPaid ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>₹{inq.paidAmount?.toLocaleString() || '500'} Paid</span>
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Unpaid Inquiry
                              </span>
                            )}

                            {/* Status Tag */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inq.status === 'Confirmed'
                                  ? 'bg-blue-100 text-[#004E64]'
                                  : inq.status === 'Contacted'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-orange-100 text-[#FF6B35]'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-[#004E64]" />
                              <strong>{inq.phone}</strong>
                            </span>
                            <span>• {inq.tripTitle}</span>
                            <span>• {inq.departureCity} Hub</span>
                            <span>• {inq.travelersCount} Person(s)</span>
                            <span>• Batch: {inq.selectedDate || inq.selectedMonth}</span>
                            <span className="font-bold text-gray-900">Total: ₹{inq.calculatedPrice.toLocaleString()}</span>
                          </div>

                          {/* Razorpay Payment ID Details */}
                          {inq.razorpayPaymentId && (
                            <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-2">
                              <span>Razorpay Ref: <strong>{inq.razorpayPaymentId}</strong></span>
                              <span className="text-emerald-700 text-[10px] font-bold">● Verified</span>
                            </div>
                          )}

                          {/* Legacy Payment / UTR Details */}
                          {!inq.razorpayPaymentId && inq.utrNumber && (
                            <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-2">
                              <span>UTR / Ref: <strong>{inq.utrNumber}</strong></span>
                              {inq.paymentMethod && <span>({inq.paymentMethod})</span>}
                            </div>
                          )}

                          {inq.message && (
                            <p className="text-xs text-gray-500 italic bg-white p-2 rounded border border-gray-200 mt-1">
                              Note: "{inq.message}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                              inq.name
                            )},%20this%20is%20RoamX%20regarding%20your%20booking%20${encodeURIComponent(
                              displayTripId
                            )}%20for%20${encodeURIComponent(inq.tripTitle)}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold bg-[#FF6B35] hover:bg-[#e05624] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <select
                            value={inq.status}
                            onChange={(e) =>
                              onUpdateInquiryStatus(inq.id, e.target.value as BookingInquiry['status'])
                            }
                            className="text-xs font-bold bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-gray-800 focus:outline-none"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Confirmed">Confirmed</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Trekker Reviews & Photo Moderation */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Trekker Reviews & User-Submitted Images Moderation</span>
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Delete inappropriate reviews or remove individual uploaded images submitted by trekkers.
                  </p>
                </div>

                <div className="text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs shrink-0">
                  {adminReviews.length} Total Reviews
                </div>
              </div>

              {adminReviews.length === 0 ? (
                <div className="p-8 text-center bg-[#F8F9FA] rounded-xl border border-gray-200 text-gray-500 text-xs">
                  No community reviews found.
                </div>
              ) : (
                <div className="space-y-4">
                  {adminReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                            alt={rev.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-gray-900">{rev.name}</h4>
                              <span className="text-[10px] text-gray-500">({rev.city || 'India'})</span>
                            </div>
                            <div className="text-[11px] text-[#004E64] font-medium">
                              Expedition: {rev.tripName || 'RoamX Trek'} • {rev.date}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setReviewToDelete(rev)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Delete this entire review permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Review</span>
                          </button>
                        </div>
                      </div>

                      {/* Title & Comment */}
                      {rev.title && (
                        <h5 className="text-xs font-bold text-gray-900">"{rev.title}"</h5>
                      )}
                      <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        "{rev.comment}"
                      </p>

                      {/* User Uploaded Photos with individual delete actions */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                            User Uploaded Images ({rev.images.length}) — Click Trash to Delete:
                          </span>

                          <div className="flex flex-wrap gap-3">
                            {rev.images.map((imgUrl: string, imgIdx: number) => (
                              <div
                                key={imgIdx}
                                className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group shadow-2xs"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Review photo ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReviewImage(rev.id, imgIdx)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg shadow cursor-pointer transition-transform hover:scale-110"
                                    title="Delete this photo from the review"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal for Review Deletion */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Delete Trekker Review?</h3>
                <p className="text-xs text-gray-500">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-gray-800">
                <span>{reviewToDelete.name} ({reviewToDelete.city || 'India'})</span>
                <span className="text-amber-500 font-bold">★ {reviewToDelete.rating || 5}.0</span>
              </div>
              <div className="text-[11px] text-[#004E64] font-medium">
                Trip: {reviewToDelete.tripName || 'RoamX Expedition'}
              </div>
              <p className="text-gray-600 italic line-clamp-3 pt-1 border-t border-gray-200/60">
                "{reviewToDelete.comment}"
              </p>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to delete this review? It will be permanently removed from the database and the public reviews section.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                disabled={isDeletingReview}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReview}
                disabled={isDeletingReview}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isDeletingReview ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
