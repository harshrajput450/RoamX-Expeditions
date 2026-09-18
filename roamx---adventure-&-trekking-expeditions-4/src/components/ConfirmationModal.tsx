import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Calendar,
  MapPin,
  Users,
  Phone,
  ArrowRight,
  ShieldCheck,
  Download,
  Copy,
  Check,
  QrCode,
  Printer,
  CreditCard,
} from 'lucide-react';
import { BookingInquiry } from '../types';

interface ConfirmationModalProps {
  inquiry: BookingInquiry | null;
  onClose: () => void;
  onOpenPayment?: (inquiry: BookingInquiry) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  inquiry,
  onClose,
  onOpenPayment,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  if (!inquiry) return null;

  const isPaid = inquiry.paymentStatus?.includes('Paid') || inquiry.status === 'Confirmed' || Boolean(inquiry.paidAmount);
  const tripIdToDisplay = inquiry.tripBookingId || inquiry.id;

  const handleCopyId = () => {
    navigator.clipboard.writeText(tripIdToDisplay);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Navy Background */}
        <div className="bg-[#004E64] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30 backdrop-blur-xs">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold">
            {isPaid ? 'Expedition Seat Confirmed!' : 'Booking Inquiry Reserved!'}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs text-blue-100">Unique Trip ID:</span>
            <span className="font-mono font-black text-sm bg-white/20 text-white px-2.5 py-0.5 rounded-md border border-white/30 flex items-center gap-1.5">
              {tripIdToDisplay}
              <button
                type="button"
                onClick={handleCopyId}
                className="hover:text-[#FF6B35] transition-colors cursor-pointer"
                title="Copy Unique Trip ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </span>
          </div>
        </div>

        {/* Voucher Details */}
        <div className="p-6 space-y-4">
          <div className="bg-[#F8F9FA] rounded-xl p-4 border border-gray-200 space-y-2.5">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Expedition:</span>
              <strong className="text-gray-900 text-right">{inquiry.tripTitle}</strong>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Traveler Name:</span>
              <strong className="text-gray-900">{inquiry.name}</strong>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>WhatsApp Contact:</span>
              <strong className="text-gray-900">{inquiry.phone}</strong>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Departure City:</span>
              <strong className="text-[#004E64]">{inquiry.departureCity}</strong>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Batch Date:</span>
              <strong className="text-gray-900">{inquiry.selectedDate || inquiry.selectedMonth}</strong>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Group Size:</span>
              <strong className="text-gray-900">{inquiry.travelersCount} Person(s)</strong>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Payment Status:</span>
              {isPaid ? (
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  Token Paid (₹{inquiry.paidAmount || 500})
                </span>
              ) : (
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                  Pending Token Payment
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-gray-700">Total Price:</span>
              <span className="text-lg font-bold text-[#004E64]">₹{inquiry.calculatedPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-blue-50/60 p-3 rounded-lg border border-blue-200/60 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#004E64] shrink-0 mt-0.5" />
            <p>
              Your unique Trip ID is <strong className="font-mono text-gray-900">{tripIdToDisplay}</strong>. A RoamX trek coordinator will reach out on WhatsApp (<strong>{inquiry.phone}</strong>) with your final confirmation pass.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href={`https://wa.me/916205054837?text=Hi%20RoamX,%20I%20have%20booked%20${encodeURIComponent(
                inquiry.tripTitle
              )}.%20My%20Trip%20ID%20is%20${tripIdToDisplay}.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 bg-[#FF6B35] hover:bg-[#e05624] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Share Trip ID on WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
