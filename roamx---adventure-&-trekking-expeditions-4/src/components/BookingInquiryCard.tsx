import React, { useState } from 'react';
import {
  Send,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  CreditCard,
  Clock,
  Phone,
  User,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Zap,
  Info,
  CalendarDays,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DepartureCity, Trip, BookingInquiry } from '../types';
import { PaymentGatewayModal, TOKEN_BOOKING_AMOUNT } from './PaymentGatewayModal';
import { BookingLogo } from './BookingLogo';
import { WhatsAppIcon } from './WhatsAppIcon';
import { SeatProgressBar } from './SeatProgressBar';

interface BookingInquiryCardProps {
  trip: Trip;
  selectedCity: DepartureCity;
  onSelectCity: (city: DepartureCity) => void;
  selectedBatchDate?: string;
  onInquirySubmitted: (inquiry: BookingInquiry) => void;
  inquiries?: BookingInquiry[];
}

export const BookingInquiryCard: React.FC<BookingInquiryCardProps> = ({
  trip,
  selectedCity,
  onSelectCity,
  selectedBatchDate,
  onInquirySubmitted,
  inquiries = [],
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  // 1 seat per transaction as required
  const travelersCount = 1;
  const [message, setMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(trip.batches[0]?.month || 'November 2026');
  const [batchDate, setBatchDate] = useState(selectedBatchDate || trip.batches[0]?.dates[0] || 'Flexible Dates');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [inquirySuccessNote, setInquirySuccessNote] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Helper to calculate age from DOB
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(dateOfBirth);
  const isAgeValid = calculatedAge !== null && calculatedAge >= 18 && calculatedAge <= 35;

  // Keep batchDate synced if parent changes it
  React.useEffect(() => {
    if (selectedBatchDate) {
      setBatchDate(selectedBatchDate);
    }
  }, [selectedBatchDate]);

  const unitPrice = selectedCity.price || trip.price;
  const totalPrice = unitPrice * travelersCount;

  // Validate form before opening payment verification modal
  const handleOpenPaymentGateway = (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInquirySuccessNote('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!gender) {
      setErrorMessage('Please select your gender (Male / Female)');
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage('Please enter your Date of Birth (Age must be between 18 and 35)');
      return;
    }
    if (calculatedAge === null || calculatedAge < 18 || calculatedAge > 35) {
      setErrorMessage(
        calculatedAge !== null
          ? `Eligibility Alert: Traveler age is ${calculatedAge} years. Expeditions are strictly curated for youth aged between 18 to 35 years.`
          : 'Please enter a valid Date of Birth'
      );
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp phone number');
      return;
    }

    setIsPaymentModalOpen(true);
  };

  // Submit pre-booking inquiry (Seat is explicitly NOT booked without payment verification)
  const handleSubmitInquiryOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInquirySuccessNote('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage('Please provide your Date of Birth for eligibility verification');
      return;
    }
    if (calculatedAge === null || calculatedAge < 18 || calculatedAge > 35) {
      setErrorMessage(
        calculatedAge !== null
          ? `Eligibility Alert: Traveler age is ${calculatedAge} years. Expeditions are strictly curated for youth aged between 18 to 35 years.`
          : 'Please enter a valid Date of Birth'
      );
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          tripTitle: trip.title,
          name: name.trim(),
          phone: phone.trim(),
          gender,
          dateOfBirth,
          age: calculatedAge,
          travelersCount: 1,
          departureCity: selectedCity.city,
          selectedMonth,
          selectedDate: batchDate,
          calculatedPrice: totalPrice,
          paidAmount: 0,
          paymentStatus: 'Unpaid',
          message: message || '',
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setInquirySuccessNote(
          'Your inquiry has been received! Please note: Your seat is NOT booked yet. To officially lock your seat, please complete the ₹500 token deposit with automated UTR verification.'
        );
        onInquirySubmitted(data.data);
      } else {
        setErrorMessage(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      setErrorMessage('Network error. Please try again or reach out on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="booking-section"
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative"
    >
      {/* Header Pricing Tag */}
      <div className="bg-[#004E64] text-white p-5">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-200">
            <BookingLogo size="sm" variant="white" />
            <span>Official Booking & Verification Portal</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            ₹500 Verified Seat Lock
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-100 font-medium block">
              Expedition Price ({selectedCity.city.split(' ')[0]})
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                ₹{unitPrice.toLocaleString()}
              </span>
              <span className="text-xs text-blue-200">/ 1 seat</span>
              {trip.originalPrice && (
                <span className="text-xs line-through text-blue-300 font-normal">
                  ₹{(trip.originalPrice + (selectedCity.price - trip.price)).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <span className="inline-flex items-center gap-1 bg-[#FF6B35] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Save ₹{trip.originalPrice ? (trip.originalPrice - trip.price).toLocaleString() : '3,500'}
          </span>
        </div>

        {/* Transparent Booking Deposit Ribbon */}
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
          <div className="flex items-center gap-1.5 font-medium text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>₹500 Verified Token Seat Deposit</span>
          </div>
          <span className="text-[11px] text-blue-200">Balance on Arrival at Basecamp</span>
        </div>
      </div>

      {/* Dynamic Seat Availability Progress Bar */}
      <div className="px-5 pt-4">
        <SeatProgressBar trip={trip} inquiries={inquiries} variant="card" />
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmitInquiryOnly} className="p-5 pt-3 space-y-4">
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {inquirySuccessNote && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{inquirySuccessNote}</span>
          </div>
        )}

        {/* Policy Notice: Strict 1 Seat & Age 18-30 */}
        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#004E64] shrink-0" />
            <span><strong>Policy:</strong> 1 Seat per booking • Age eligibility: <strong>18 to 35 years</strong></span>
          </div>
          <span className="bg-[#004E64] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
            ₹500 / Seat
          </span>
        </div>

        {/* Departure City Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#004E64]" />
            <span>Departure City</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {trip.departureCities.slice(0, 4).map((cityObj) => {
              const isSelected = selectedCity.city === cityObj.city;
              return (
                <button
                  type="button"
                  key={cityObj.city}
                  onClick={() => onSelectCity(cityObj)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-[#004E64] bg-blue-50/60 text-[#004E64] font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="truncate font-medium">{cityObj.city.split('(')[0].trim()}</div>
                  <div className="text-[11px] font-bold text-[#004E64]">₹{cityObj.price.toLocaleString()}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Month & Batch Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Travel Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                const matched = trip.batches.find((b) => b.month === e.target.value);
                if (matched && matched.dates[0]) {
                  setBatchDate(matched.dates[0]);
                }
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#004E64]"
            >
              {trip.batches.map((b) => (
                <option key={b.month} value={b.month}>
                  {b.month} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Batch Dates</label>
            <select
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#004E64]"
            >
              {trip.batches
                .find((b) => b.month === selectedMonth)
                ?.dates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )) || <option value="Custom Dates">Custom Dates</option>}
            </select>
          </div>
        </div>

        {/* Seat Count (Locked to 1 seat per transaction) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#004E64]" />
              <span>Seat Allocation</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              1 Seat per Booking (₹500 Token)
            </span>
          </label>
          <div className="flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
            <span>Primary Explorer Slot (1 Person)</span>
            <strong className="text-gray-900 font-bold">₹{totalPrice.toLocaleString()}</strong>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>Full Name *</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Yashvardhan Roy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] transition-colors"
          />
        </div>

        {/* Gender Selection & Date of Birth (DOB) Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Gender *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('Male')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                  gender === 'Male'
                    ? 'border-2 border-[#004E64] bg-blue-50 text-[#004E64] shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('Female')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                  gender === 'Female'
                    ? 'border-2 border-[#FF6B35] bg-orange-50 text-[#FF6B35] shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                <span>Date of Birth *</span>
              </span>
              {calculatedAge !== null && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isAgeValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {calculatedAge} yrs ({isAgeValid ? 'Eligible' : 'Age 18-35 Only'})
                </span>
              )}
            </label>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] transition-colors"
            />
          </div>
        </div>

        {/* WhatsApp Phone Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>WhatsApp Phone Number *</span>
          </label>
          <input
            type="tel"
            required
            placeholder="+91 62050 54837"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] transition-colors"
          />
        </div>

        {/* Message / Special Request */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
            <span>Custom Note / Dietary / Medical</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Jain food or tent sharing preference"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#004E64] transition-colors"
          />
        </div>

        {/* Razorpay Payment Gateway Guarantee Banner */}
        <div className="p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#004E64] text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>Razorpay Payment Gateway</span>
                <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                  Instant Verification
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                Seat booking is officially confirmed once verified via Razorpay (UPI, Cards, NetBanking, Wallets).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* 1. Primary: Book & Pay with Razorpay */}
          <button
            type="button"
            id="btn-book-pay-razorpay"
            onClick={handleOpenPaymentGateway}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6B35] to-[#f25820] hover:from-[#f25820] hover:to-[#e04812] active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-white" />
            <span>Book & Pay with Razorpay</span>
            <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300 animate-bounce" />
          </button>

          {/* 2. Secondary: Chat with Us on WhatsApp */}
          <a
            href={`https://wa.me/916205054837?text=${encodeURIComponent(
              `Hi RoamX Team, I'd like to book ${trip.title} from ${selectedCity.city} for 1 seat (₹${totalPrice.toLocaleString()}). Name: ${name || '[Enter Name]'}, Age: ${calculatedAge || '[Age]'}, Gender: ${gender}. Please confirm batch slot.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
            <span>Chat with Us on WhatsApp (+91 6205054837)</span>
          </a>

          {/* 3. Tertiary: Ask Question / Pre-Booking Inquiry */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-gray-500" />
                <span>Submit Question (No Seat Reserved Without Verification)</span>
              </>
            )}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#004E64]" />
            <span>Instant UTR Verification</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>100% Refundable Deposit</span>
          </span>
        </div>
      </form>

      {/* UPI QR Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        trip={trip}
        selectedCity={selectedCity}
        selectedMonth={selectedMonth}
        selectedDate={batchDate}
        travelersCount={1}
        customerName={name}
        customerPhone={phone}
        customerGender={gender}
        customerDob={dateOfBirth}
        customerAge={calculatedAge || undefined}
        customMessage={message}
        onPaymentSuccess={(inquiry) => {
          onInquirySubmitted(inquiry);
          setName('');
          setPhone('');
          setDateOfBirth('');
          setMessage('');
        }}
      />
    </div>
  );
};
