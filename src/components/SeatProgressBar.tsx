import React from 'react';
import { Users, Zap, Flame, CheckCircle2, AlertCircle } from 'lucide-react';
import { Trip, BookingInquiry } from '../types';

export interface SeatStats {
  totalSeats: number;
  bookedSeats: number;
  remainingSeats: number;
  fillPercentage: number;
  statusLabel: 'Available' | 'Filling Fast' | 'Almost Full' | 'Sold Out';
  badgeColor: string;
  barColor: string;
  inquiryCount: number;
  confirmedCount: number;
}

export function calculateTripSeatStats(trip: Trip, inquiries: BookingInquiry[] = []): SeatStats {
  const totalSeats = trip.totalSeats || 16;

  // Filter inquiries for this specific trip
  const tripInquiries = inquiries.filter(
    (i) => i.tripId === trip.id || (i.tripTitle && i.tripTitle.toLowerCase() === trip.title.toLowerCase())
  );

  // Count verified / confirmed / active bookings from inquiries database
  const confirmedCount = tripInquiries.filter(
    (i) =>
      i.status === 'Confirmed' ||
      i.paymentStatus === 'Verified' ||
      i.paymentStatus === 'Paid (₹500)' ||
      (i.paidAmount && i.paidAmount > 0)
  ).length;

  const baseBooked = trip.bookedSeats || 0;
  // If confirmed inquiries exist, ensure they reflect in filled seats
  const dynamicBooked = Math.max(baseBooked, baseBooked + confirmedCount);
  const bookedSeats = Math.min(totalSeats, dynamicBooked);
  const remainingSeats = Math.max(0, totalSeats - bookedSeats);
  const fillPercentage = Math.min(100, Math.max(5, Math.round((bookedSeats / totalSeats) * 100)));

  let statusLabel: 'Available' | 'Filling Fast' | 'Almost Full' | 'Sold Out' = 'Available';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let barColor = 'bg-gradient-to-r from-emerald-500 to-teal-500';

  if (remainingSeats === 0 || fillPercentage >= 100) {
    statusLabel = 'Sold Out';
    badgeColor = 'bg-gray-100 text-gray-700 border-gray-300';
    barColor = 'bg-gray-500';
  } else if (remainingSeats <= 4 || fillPercentage >= 75) {
    statusLabel = 'Almost Full';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    barColor = 'bg-gradient-to-r from-orange-500 via-[#FF6B35] to-rose-500';
  } else if (remainingSeats <= 8 || fillPercentage >= 45) {
    statusLabel = 'Filling Fast';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    barColor = 'bg-gradient-to-r from-amber-400 to-[#FF6B35]';
  }

  return {
    totalSeats,
    bookedSeats,
    remainingSeats,
    fillPercentage,
    statusLabel,
    badgeColor,
    barColor,
    inquiryCount: tripInquiries.length,
    confirmedCount,
  };
}

interface SeatProgressBarProps {
  trip: Trip;
  inquiries?: BookingInquiry[];
  variant?: 'compact' | 'card' | 'detailed' | 'hero-dark';
  className?: string;
}

export const SeatProgressBar: React.FC<SeatProgressBarProps> = ({
  trip,
  inquiries = [],
  variant = 'detailed',
  className = '',
}) => {
  const stats = calculateTripSeatStats(trip, inquiries);

  if (variant === 'compact') {
    return (
      <div className={`space-y-1.5 w-full ${className}`}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Users className="w-3 h-3 text-[#004E64]" />
            <span>{stats.bookedSeats}/{stats.totalSeats} Seats Filled</span>
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${stats.badgeColor}`}>
            {stats.remainingSeats === 0 ? 'Sold Out' : `${stats.remainingSeats} left`}
          </span>
        </div>
        {/* Progress Bar track */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${stats.barColor}`}
            style={{ width: `${stats.fillPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-2.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#004E64]" />
            <span>Seat Availability</span>
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${stats.badgeColor} flex items-center gap-1`}>
            {stats.statusLabel === 'Filling Fast' && <Flame className="w-3 h-3 text-orange-500" />}
            {stats.statusLabel === 'Almost Full' && <Zap className="w-3 h-3 text-rose-500" />}
            <span>{stats.statusLabel} ({stats.remainingSeats} Left)</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${stats.barColor}`}
            style={{ width: `${stats.fillPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>{stats.bookedSeats} / {stats.totalSeats} Seats Locked</span>
          <span className="font-semibold text-gray-700">{stats.fillPercentage}% Filled</span>
        </div>
      </div>
    );
  }

  if (variant === 'hero-dark') {
    return (
      <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 text-white ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span className="font-bold text-white">Batch Availability</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6B35] text-white shadow-xs">
            {stats.remainingSeats === 0 ? 'SOLD OUT' : `${stats.remainingSeats} SEATS LEFT`}
          </span>
        </div>

        {/* Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-[#FF6B35] to-orange-400 rounded-full transition-all duration-700"
            style={{ width: `${stats.fillPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-blue-100">
          <span>{stats.bookedSeats} of {stats.totalSeats} seats filled</span>
          <span className="font-bold text-amber-300">{stats.fillPercentage}% Booked</span>
        </div>
      </div>
    );
  }

  // Detailed (Default)
  return (
    <div className={`p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-900 font-bold">
          <Users className="w-4 h-4 text-[#004E64]" />
          <span>Live Batch Fill Status</span>
        </div>

        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stats.badgeColor}`}>
          {stats.statusLabel === 'Filling Fast' && <Flame className="w-3 h-3 text-orange-500 animate-pulse" />}
          {stats.statusLabel === 'Almost Full' && <Zap className="w-3 h-3 text-rose-500 animate-bounce" />}
          {stats.statusLabel === 'Available' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
          <span>{stats.statusLabel}</span>
        </span>
      </div>

      {/* Progress track */}
      <div className="space-y-1">
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full shadow-sm ${stats.barColor}`}
            style={{ width: `${stats.fillPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-0.5">
          <span>
            <strong className="text-gray-900 font-bold">{stats.bookedSeats}</strong> of {stats.totalSeats} seats filled
          </span>
          <span className="font-bold text-[#004E64]">{stats.remainingSeats} seats available ({stats.fillPercentage}%)</span>
        </div>
      </div>
    </div>
  );
};
