import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Phone,
  Sparkles,
  Printer,
  Zap,
} from 'lucide-react';
import { BookingInquiry, DepartureCity, Trip } from '../types';
import { Logo } from './Logo';
import { WhatsAppIcon } from './WhatsAppIcon';
import { RazorpayPayment } from './RazorpayPayment';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  selectedCity: DepartureCity;
  selectedMonth: string;
  selectedDate: string;
  travelersCount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerGender?: 'Male' | 'Female';
  customerDob?: string;
  customerAge?: number;
  customMessage?: string;
  onPaymentSuccess: (inquiry: BookingInquiry) => void;
}

export const TOKEN_BOOKING_AMOUNT = 500;
export const OFFICIAL_PHONE = '+91 6205054837';

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  trip,
  selectedCity,
  selectedMonth,
  selectedDate,
  travelersCount = 1,
  customerName,
  customerPhone,
  customerEmail,
  customerGender = 'Male',
  customerDob,
  customerAge,
  customMessage,
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState<'pay' | 'success'>('pay');
  const [paymentType, setPaymentType] = useState<'token' | 'full'>('token');
  const [copiedTripId, setCopiedTripId] = useState(false);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);
  const [confirmedInquiry, setConfirmedInquiry] = useState<BookingInquiry | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes countdown

  const unitPrice = selectedCity.price || trip.price;
  const totalPrice = unitPrice * Math.max(1, travelersCount);
  const remainingBalance = Math.max(
    0,
    totalPrice - (paymentType === 'full' ? totalPrice : TOKEN_BOOKING_AMOUNT)
  );

  useEffect(() => {
    if (isOpen) {
      setStep('pay');
      setPaymentType('token');
      setTimeRemaining(600);
      setConfirmedInquiry(null);
    }
  }, [isOpen]);

  // 10-minute reservation lock countdown
  useEffect(() => {
    if (!isOpen || step === 'success') return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, step]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyTripId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTripId(true);
    setTimeout(() => setCopiedTripId(false), 2000);
  };

  const handleCopyPaymentId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedPaymentId(true);
    setTimeout(() => setCopiedPaymentId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVerifiedPaymentSuccess = (inquiry: BookingInquiry) => {
    setConfirmedInquiry(inquiry);
    setStep('success');

    // Celebrate with confetti
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#004E64', '#FF6B35', '#10B981', '#F59E0B'],
    });

    onPaymentSuccess(inquiry);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full min-h-[100dvh] sm:min-h-0 sm:max-w-xl sm:rounded-2xl rounded-none shadow-2xl border-0 sm:border border-gray-200 overflow-hidden relative animate-in fade-in duration-200 my-auto flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#004E64] text-white p-4 sm:p-5 relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xs">
              <Zap className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  RoamX Razorpay Payment Gateway
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Instant Verification
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Official Standard Checkout • Cards, UPI, NetBanking & Wallets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-full bg-white/5 hover:bg-white/15 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Razorpay Payment Screen */}
        {step === 'pay' && (
          <div className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            
            {/* Countdown & Reservation Lock Banner */}
            <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <div className="text-xs">
                  <span className="text-gray-600">Seat Reservation: </span>
                  <strong className="text-gray-900 font-semibold">Slot Held Temporarily</strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] bg-white px-2.5 py-1 rounded-lg border border-orange-200 shadow-2xs">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Expires in: {formatTimer(timeRemaining)}</span>
              </div>
            </div>

            {/* Traveler & Trip Snapshot */}
            <div className="bg-[#F8F9FA] rounded-xl p-3.5 border border-gray-200 text-xs flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-gray-900 text-sm">{trip.title}</div>
                <div className="text-[11px] text-gray-600">
                  {customerName} • {customerGender} {customerAge ? `(${customerAge} yrs)` : ''} • Hub: {selectedCity.city}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  Travel Batch: {selectedDate || selectedMonth}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">Trip Value</div>
                <div className="text-base font-black text-[#004E64]">₹{totalPrice.toLocaleString()}</div>
              </div>
            </div>

            {/* Payment Mode Selector: Token Deposit vs Full Payment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                Select Payment Option:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: Token Deposit */}
                <button
                  type="button"
                  onClick={() => setPaymentType('token')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentType === 'token'
                      ? 'border-[#004E64] bg-blue-50/70 ring-2 ring-[#004E64]/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                    <span className="text-sm font-black text-[#004E64]">₹{TOKEN_BOOKING_AMOUNT}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900">₹500 Seat Deposit</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    Lock seat now; pay balance of ₹{remainingBalance.toLocaleString()} on arrival at basecamp.
                  </div>
                </button>

                {/* Option 2: Full Payment */}
                <button
                  type="button"
                  onClick={() => setPaymentType('full')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentType === 'full'
                      ? 'border-[#004E64] bg-blue-50/70 ring-2 ring-[#004E64]/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                      100% PAID
                    </span>
                    <span className="text-sm font-black text-[#004E64]">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900">Full Expedition</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    Complete trip payment upfront with zero balance due at basecamp.
                  </div>
                </button>
              </div>
            </div>

            {/* Official Razorpay Payment Component */}
            <RazorpayPayment
              trip={trip}
              selectedCity={selectedCity}
              customerName={customerName}
              customerPhone={customerPhone}
              customerEmail={customerEmail || ''}
              customerGender={customerGender}
              customerDob={customerDob || ''}
              customerAge={customerAge}
              selectedMonth={selectedMonth}
              selectedDate={selectedDate}
              customMessage={customMessage}
              paymentType={paymentType}
              totalPrice={totalPrice}
              tokenAmount={TOKEN_BOOKING_AMOUNT}
              onPaymentSuccess={handleVerifiedPaymentSuccess}
            />

            {/* Support Contact */}
            <div className="text-[11px] text-gray-500 flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>Assistance Hotline: <strong>{OFFICIAL_PHONE}</strong></span>
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">24x7 Expedition Support</span>
            </div>

          </div>
        )}

        {/* STEP 2: Confirmed Trip ID Voucher Pass (Success) */}
        {step === 'success' && confirmedInquiry && (
          <div className="p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            
            {/* Celebratory Banner */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-300 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Payment Verified & Seat Confirmed!
              </h3>
              <p className="text-xs text-gray-600">
                Your payment via Razorpay has been cryptographically verified. Your expedition pass is ready.
              </p>
            </div>

            {/* Official Digital Boarding Pass Voucher Card */}
            <div className="bg-gradient-to-br from-[#004E64] to-[#002f3d] text-white rounded-2xl p-5 shadow-xl border border-blue-900/40 relative overflow-hidden">
              
              {/* Pass Header */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Logo size="sm" variant="light" />
                  <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
                    Official Expedition Pass
                  </span>
                </div>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  VERIFIED VIA RAZORPAY
                </span>
              </div>

              {/* Trip ID Highlight */}
              <div className="bg-black/30 backdrop-blur-xs rounded-xl p-3.5 border border-white/20 flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] uppercase text-blue-200 tracking-wider">
                    Official Booking ID
                  </div>
                  <div className="font-mono text-lg sm:text-xl font-black text-[#FF6B35] tracking-wide">
                    {confirmedInquiry.tripBookingId}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyTripId(confirmedInquiry.tripBookingId || '')}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedTripId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Breakdown Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-blue-200 text-[11px] block">Expedition</span>
                  <strong className="text-white font-bold">{confirmedInquiry.tripTitle}</strong>
                </div>

                <div>
                  <span className="text-blue-200 text-[11px] block">Explorer Details</span>
                  <strong className="text-white font-bold">
                    {confirmedInquiry.name} ({customerGender}, {confirmedInquiry.age || customerAge || '18-35'} yrs)
                  </strong>
                </div>

                <div>
                  <span className="text-blue-200 text-[11px] block">Departure Hub</span>
                  <strong className="text-white font-bold">{confirmedInquiry.departureCity}</strong>
                </div>

                <div>
                  <span className="text-blue-200 text-[11px] block">Travel Batch</span>
                  <strong className="text-white font-bold">
                    {confirmedInquiry.selectedDate || confirmedInquiry.selectedMonth}
                  </strong>
                </div>

                <div>
                  <span className="text-blue-200 text-[11px] block">Amount Paid</span>
                  <strong className="text-emerald-300 font-bold">
                    ₹{confirmedInquiry.paidAmount?.toLocaleString()} (Verified)
                  </strong>
                </div>

                <div>
                  <span className="text-blue-200 text-[11px] block">Remaining Balance</span>
                  <strong className="text-[#FF6B35] font-bold">
                    {confirmedInquiry.paidAmount && confirmedInquiry.calculatedPrice && confirmedInquiry.calculatedPrice > confirmedInquiry.paidAmount
                      ? `₹${(confirmedInquiry.calculatedPrice - confirmedInquiry.paidAmount).toLocaleString()} (at Basecamp)`
                      : '₹0 (Fully Paid)'}
                  </strong>
                </div>
              </div>

              {/* Footer transaction meta */}
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-blue-200">
                <div className="flex items-center gap-1.5 font-mono">
                  <span>Payment ID: {confirmedInquiry.razorpayPaymentId || 'Verified'}</span>
                  {confirmedInquiry.razorpayPaymentId && (
                    <button
                      type="button"
                      onClick={() => handleCopyPaymentId(confirmedInquiry.razorpayPaymentId || '')}
                      className="text-white/70 hover:text-white"
                      title="Copy Payment ID"
                    >
                      {copiedPaymentId ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span>Helpline:</span>
                  <a
                    href="tel:+916205054837"
                    className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                    title="Call Helpline"
                    aria-label="Call Helpline"
                  >
                    <Phone className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://wa.me/916205054837"
                    target="_blank"
                    rel="noreferrer"
                    className="w-4 h-4 rounded-full bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 flex items-center justify-center transition-colors"
                    title="WhatsApp Support"
                    aria-label="WhatsApp Support"
                  >
                    <WhatsAppIcon className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <a
                href={`https://wa.me/916205054837?text=Hi%20RoamX,%20I%20have%20completed%20payment%20via%20Razorpay%20for%20${encodeURIComponent(
                  confirmedInquiry.tripTitle
                )}.%20My%20Booking%20ID%20is%20${confirmedInquiry.tripBookingId}%20(Payment%20Ref:%20${confirmedInquiry.razorpayPaymentId || 'Verified'}).%20Please%20send%20my%20expedition%20kit%20and%20basecamp%20details.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-[#FF6B35] hover:bg-[#e05624] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Chat on WhatsApp for Expedition Kit</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#004E64]" />
                  <span>Print Pass</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
