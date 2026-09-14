import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  Loader2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Trip, DepartureCity, BookingInquiry } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  trip: Trip;
  selectedCity: DepartureCity;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerGender: string;
  customerDob: string;
  customerAge?: number;
  selectedMonth?: string;
  selectedDate?: string;
  customMessage?: string;
  paymentType?: 'token' | 'full';
  totalPrice: number;
  tokenAmount: number;
  onPaymentSuccess: (inquiry: BookingInquiry) => void;
  onPaymentError?: (errorMessage: string) => void;
  onPaymentDismiss?: () => void;
}

export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  trip,
  selectedCity,
  customerName,
  customerPhone,
  customerEmail,
  customerGender,
  customerDob,
  customerAge,
  selectedMonth,
  selectedDate,
  customMessage,
  paymentType = 'token',
  totalPrice,
  tokenAmount,
  onPaymentSuccess,
  onPaymentError,
  onPaymentDismiss,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Dynamically ensure Razorpay script is loaded
  useEffect(() => {
    if (window.Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.warn('⚠️ Could not load Razorpay script from CDN');
    };
    document.body.appendChild(script);

    return () => {
      // keep script attached for subsequent usages
    };
  }, []);

  const payableAmount = paymentType === 'full' ? totalPrice : tokenAmount;

  const handleInitiatePayment = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Create order on the server
      // Security: Backend fetches trip price directly from DB and never trusts client amounts
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          customerName,
          customerPhone,
          customerEmail,
          departureCity: selectedCity.city,
          selectedMonth,
          selectedDate,
          travelersCount: 1,
          paymentType,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay payment order');
      }

      // Check if Razorpay SDK script is available on the client
      if (!window.Razorpay) {
        // If script blocked by browser extension or test environment
        console.warn('Razorpay script not ready; attempting fallback simulation');
        if (orderData.isMock || !orderData.keyId) {
          await handleSimulatedSuccess(orderData.orderId);
          return;
        }
        throw new Error(
          'Payment gateway script could not be loaded. Please check your internet connection or ad-blocker.'
        );
      }

      // 2. Launch official Razorpay Checkout Modal
      const options = {
        key: orderData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'ROAMX',
        description: `${trip.title} (${paymentType === 'full' ? 'Full Expedition' : '₹500 Seat Deposit'})`,
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=128&q=80',
        order_id: orderData.orderId,
        prefill: {
          name: customerName,
          email: customerEmail || '',
          contact: customerPhone,
        },
        notes: {
          tripId: trip.id,
          tripTitle: trip.title,
          departureCity: selectedCity.city,
          customerAge: String(customerAge || ''),
        },
        theme: {
          color: '#004E64',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            if (onPaymentDismiss) onPaymentDismiss();
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setIsLoading(false);
          setIsVerifying(true);

          try {
            // 3. Server-side payment verification (HMAC SHA-256)
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tripId: trip.id,
                tripTitle: trip.title,
                name: customerName,
                phone: customerPhone,
                email: customerEmail,
                gender: customerGender,
                dateOfBirth: customerDob,
                age: customerAge,
                travelersCount: 1,
                departureCity: selectedCity.city,
                selectedMonth,
                selectedDate,
                paymentType,
                message: customMessage,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed on the server.');
            }

            setIsVerifying(false);
            onPaymentSuccess(verifyData.data);
          } catch (verifyErr: any) {
            console.error('❌ Verification error:', verifyErr);
            setIsVerifying(false);
            setErrorMessage(verifyErr.message || 'Signature verification failed.');
            if (onPaymentError) onPaymentError(verifyErr.message);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (failRes: any) => {
        setIsLoading(false);
        const reason = failRes?.error?.description || 'Payment was declined or failed.';
        setErrorMessage(reason);
        if (onPaymentError) onPaymentError(reason);
      });

      razorpayInstance.open();
      setIsLoading(false);
    } catch (err: any) {
      console.error('❌ Checkout launch error:', err);
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to initialize payment gateway.');
      if (onPaymentError) onPaymentError(err.message);
    }
  };

  const handleSimulatedSuccess = async (orderId: string) => {
    setIsLoading(false);
    setIsVerifying(true);
    try {
      const simPaymentId = `pay_sim_${Date.now()}`;
      const simSignature = `sig_sim_${Date.now()}`;

      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: simPaymentId,
          razorpay_signature: simSignature,
          tripId: trip.id,
          tripTitle: trip.title,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          gender: customerGender,
          dateOfBirth: customerDob,
          age: customerAge,
          travelersCount: 1,
          departureCity: selectedCity.city,
          selectedMonth,
          selectedDate,
          paymentType,
          message: customMessage,
        }),
      });

      const verifyData = await verifyRes.json();
      setIsVerifying(false);

      if (verifyData.success && verifyData.data) {
        onPaymentSuccess(verifyData.data);
      } else {
        throw new Error(verifyData.error || 'Simulation verification error');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-semibold">Payment Issue</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Payment Gateway Feature Highlights */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Razorpay Payment Gateway
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            256-Bit SSL Encrypted
          </span>
        </div>

        {/* Payment Channels Supported */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200/60 text-center">
            <Smartphone className="w-4 h-4 text-[#004E64] mb-1" />
            <span className="text-[10px] font-bold text-gray-800">UPI / QR</span>
            <span className="text-[8px] text-gray-400">GPay, PhonePe</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200/60 text-center">
            <CreditCard className="w-4 h-4 text-[#004E64] mb-1" />
            <span className="text-[10px] font-bold text-gray-800">Cards</span>
            <span className="text-[8px] text-gray-400">Credit & Debit</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200/60 text-center">
            <Building2 className="w-4 h-4 text-[#004E64] mb-1" />
            <span className="text-[10px] font-bold text-gray-800">NetBanking</span>
            <span className="text-[8px] text-gray-400">50+ Banks</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200/60 text-center">
            <Wallet className="w-4 h-4 text-[#004E64] mb-1" />
            <span className="text-[10px] font-bold text-gray-800">Wallets</span>
            <span className="text-[8px] text-gray-400">Paytm, Mobikwik</span>
          </div>
        </div>
      </div>

      {/* Pay CTA Button */}
      <button
        type="button"
        id="btn-pay-razorpay"
        disabled={isLoading || isVerifying}
        onClick={handleInitiatePayment}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#004E64] to-[#003847] hover:from-[#003d4d] hover:to-[#002b36] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {isLoading || isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#FF6B35]" />
            <span>{isVerifying ? 'Verifying Signature with Bank...' : 'Connecting to Razorpay...'}</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 text-[#FF6B35] group-hover:scale-110 transition-transform" />
            <span>Pay ₹{payableAmount.toLocaleString()} with Razorpay</span>
            <Lock className="w-3.5 h-3.5 text-white/70 ml-1" />
          </>
        )}
      </button>

      {/* Trust & Policy Microcopy */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 px-1">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Instant automated seat confirmation
        </span>
        <span>Standard RBI Compliant Checkout</span>
      </div>
    </div>
  );
};
