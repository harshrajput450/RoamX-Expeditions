import express from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  getTrips,
  getTripById,
  getHomepageSettings,
  getLiveTrip,
  createTrip,
  setLiveTrip,
  setHeroImage,
  updateTrip,
  deleteTrip,
  duplicateTrip,
  updateTripStatus,
  addTripGalleryImage,
  deleteTripGalleryImage,
  deleteTripGalleryImageByUrl,
  getReviews,
  createReview,
  deleteReview,
  deleteReviewImage,
  getInquiries,
  createInquiry,
  findInquiryByRazorpayPaymentId,
  saveRazorpayBooking,
  verifyAndSaveUtrInquiry,
  updateInquiryStatus,
  getAnnouncements,
  getActiveAnnouncement,
  createAnnouncement,
  toggleAnnouncementActive,
  deleteAnnouncement,
} from './db';
import { uploadImageToStorage, deleteImageFromStorage } from './supabase';
import {
  getRazorpayKeyId,
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from './razorpay';

export function createExpressApp() {
  const app = express();

  // Middleware with high body limit to support base64 photo uploads seamlessly
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Lazy initialize Gemini AI client
  let geminiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (geminiClient) return geminiClient;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        geminiClient = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('Gemini client init failed:', err);
      }
    }
    return geminiClient;
  }

  // ----------------------------------------------------
  // Health check
  // ----------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'RoamX Expeditions Production API',
      database: process.env.SUPABASE_URL ? 'Supabase PostgreSQL' : 'Memory Store (Dev Fallback)',
      timestamp: new Date().toISOString(),
    });
  });

  // ----------------------------------------------------
  // 1. Direct Image Upload Endpoint (Supabase Storage)
  // ----------------------------------------------------
  app.post('/api/upload', async (req, res) => {
    try {
      const { image, folder = 'trips' } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: 'Image data or URL is required' });
      }

      const validFolders = ['trips', 'reviews', 'avatars'] as const;
      const targetFolder = validFolders.includes(folder) ? folder : 'trips';

      const permanentUrl = await uploadImageToStorage(image, targetFolder);
      return res.json({ success: true, url: permanentUrl });
    } catch (err: any) {
      console.error('Error in /api/upload:', err);
      return res.status(500).json({ success: false, error: err.message || 'Image upload failed' });
    }
  });

  // ----------------------------------------------------
  // 2. Announcements Endpoints
  // ----------------------------------------------------
  app.get('/api/announcements/active', async (req, res) => {
    try {
      const active = await getActiveAnnouncement();
      res.json({ success: true, data: active });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/announcements', async (req, res) => {
    try {
      const all = await getAnnouncements();
      res.json({ success: true, data: all });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/announcements', async (req, res) => {
    try {
      const { text, link, badge, isActive } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: 'Announcement text is required' });
      }
      const created = await createAnnouncement({ text, link, badge, isActive });
      const all = await getAnnouncements();
      res.status(201).json({ success: true, data: created, all });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/announcements/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await toggleAnnouncementActive(id);
      res.json({ success: true, all: result.all, active: result.active });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/announcements/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await deleteAnnouncement(id);
      res.json({ success: true, message: 'Announcement deleted', data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // 3. Trips & Homepage Settings Endpoints
  // ----------------------------------------------------
  app.get('/api/homepage-settings', async (req, res) => {
    try {
      const settings = await getHomepageSettings();
      res.json({ success: true, liveTripId: settings.liveTripId, liveTrip: settings.liveTrip });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/trips/live', async (req, res) => {
    try {
      const liveTrip = await getLiveTrip();
      res.json({ success: true, data: liveTrip });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/trips', async (req, res) => {
    try {
      const trips = await getTrips();
      res.json({ success: true, data: trips });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/trips/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const trip = await getTripById(id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }
      res.json({ success: true, data: trip });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/trips', async (req, res) => {
    try {
      if (!req.body.title) {
        return res.status(400).json({ success: false, error: 'Expedition title is required' });
      }
      const newTrip = await createTrip(req.body);
      res.status(201).json({ success: true, data: newTrip, message: 'New expedition created successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/trips/:id/set-live', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await setLiveTrip(id);
      res.json({
        success: true,
        liveTripId: result.liveTripId,
        liveTrip: result.liveTrip,
        trips: result.trips,
        message: 'Trip set as Live on homepage',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/trips/:id/hero', async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'imageUrl is required' });
      }
      const updated = await setHeroImage(id, imageUrl);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }
      res.json({ success: true, data: updated, message: 'Cover hero photo set successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/trips/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await updateTrip(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }
      res.json({ success: true, data: updated, message: 'Trip details updated permanently' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/trips/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }
      const updated = await updateTripStatus(id, status);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }
      res.json({ success: true, data: updated, message: `Trip status updated to ${status}` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/trips/:id/duplicate', async (req, res) => {
    try {
      const { id } = req.params;
      const duplicated = await duplicateTrip(id);
      if (!duplicated) {
        return res.status(404).json({ success: false, error: 'Trip not found to duplicate' });
      }
      res.status(201).json({ success: true, data: duplicated, message: 'New limited drop batch duplicated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/trips/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteTrip(id);
      if (!success) {
        return res.status(500).json({ success: false, error: 'Failed to delete trip' });
      }
      res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/trips/:id/gallery', async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl, makeHero } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'Image URL or base64 is required' });
      }
      const updated = await addTripGalleryImage(id, imageUrl, Boolean(makeHero));
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }
      res.json({ success: true, data: updated, message: 'Gallery image uploaded and saved' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/trips/:tripId/gallery', async (req, res) => {
    try {
      const { tripId } = req.params;
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'Image URL is required to delete' });
      }
      const result = await deleteTripGalleryImageByUrl(tripId, imageUrl);
      if (!result.trip) {
        return res.status(404).json({ success: false, error: 'Trip or image not found' });
      }
      res.json({
        success: true,
        data: result.trip,
        removedImage: result.removedUrl,
        message: 'Gallery photo deleted permanently',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/trips/:tripId/gallery/:imageIndex', async (req, res) => {
    try {
      const { tripId, imageIndex } = req.params;
      const idx = parseInt(imageIndex, 10);
      if (isNaN(idx)) {
        return res.status(400).json({ success: false, error: 'Invalid image index' });
      }

      const result = await deleteTripGalleryImage(tripId, idx);
      if (!result.trip) {
        return res.status(404).json({ success: false, error: 'Trip or image not found' });
      }

      res.json({
        success: true,
        data: result.trip,
        removedImage: result.removedUrl,
        message: 'Gallery photo deleted permanently',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // 4. Inquiries & Bookings Endpoints
  // ----------------------------------------------------
  app.get('/api/inquiries', async (req, res) => {
    try {
      const inqs = await getInquiries();
      res.json({ success: true, data: inqs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/inquiries', async (req, res) => {
    try {
      const { name, phone, tripTitle } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ success: false, error: 'Name and Phone number are required' });
      }

      const newInquiry = await createInquiry(req.body);
      res.status(201).json({ success: true, data: newInquiry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // RAZORPAY PAYMENT GATEWAY ENDPOINTS
  // ==========================================

  // Get Razorpay public config (Safe for frontend)
  app.get('/api/payment/config', (req, res) => {
    const keyId = getRazorpayKeyId();
    res.json({
      success: true,
      keyId,
      currency: 'INR',
    });
  });

  // Create server-side Razorpay order
  // NEVER trusts frontend amount - always fetches from DB
  app.post('/api/payment/create-order', async (req, res) => {
    try {
      const {
        tripId,
        customerName,
        customerPhone,
        customerEmail,
        departureCity,
        selectedMonth,
        selectedDate,
        travelersCount = 1,
        paymentType = 'token', // 'token' (₹500 deposit) or 'full' (full trip price)
      } = req.body;

      if (!tripId) {
        return res.status(400).json({ success: false, error: 'tripId is required to create a payment order' });
      }

      // Security: Fetch trip from DB to get the verified price
      const trip = await getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found in database' });
      }

      // Calculate unit price based on departure city
      let unitPrice = trip.price;
      if (departureCity && trip.departureCities && trip.departureCities.length > 0) {
        const matchedCity = trip.departureCities.find(
          (c) => c.city.toLowerCase() === departureCity.toLowerCase() ||
                 c.city.toLowerCase().includes(departureCity.toLowerCase())
        );
        if (matchedCity && matchedCity.price) {
          unitPrice = matchedCity.price;
        }
      }

      const count = Math.max(1, Number(travelersCount) || 1);
      const fullTotalPrice = unitPrice * count;

      // Token deposit is ₹500 per seat, or full payment
      const payableAmount = paymentType === 'full' ? fullTotalPrice : 500 * count;
      const amountInPaise = Math.round(payableAmount * 100);

      const receipt = `rx_rcpt_${Date.now().toString().slice(-8)}_${Math.floor(Math.random() * 1000)}`;

      const order = await createRazorpayOrder({
        amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          tripId: trip.id,
          tripTitle: trip.title,
          customerName: customerName || '',
          customerPhone: customerPhone || '',
          paymentType,
          travelersCount: String(count),
          departureCity: departureCity || '',
        },
      });

      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount, // in paise
        payableAmount, // in rupees
        fullTotalPrice, // in rupees
        currency: order.currency,
        keyId: getRazorpayKeyId(),
        isMock: order.isMock,
        trip: {
          id: trip.id,
          title: trip.title,
          price: unitPrice,
        },
      });
    } catch (err: any) {
      console.error('❌ Error creating Razorpay order:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to create Razorpay payment order',
      });
    }
  });

  // Verify Razorpay payment signature & confirm booking
  // Server-side HMAC SHA256 verification
  app.post('/api/payment/verify', async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        tripId,
        tripTitle,
        name,
        phone,
        email,
        gender,
        dateOfBirth,
        age,
        travelersCount = 1,
        departureCity,
        selectedMonth,
        selectedDate,
        paymentType = 'token',
        message,
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing Razorpay order ID or payment ID',
        });
      }

      // 1. Signature Verification via HMAC SHA-256
      const isValid = verifyRazorpayPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature || '',
      });

      if (!isValid) {
        console.error('❌ Razorpay signature verification failed for payment:', razorpay_payment_id);
        return res.status(400).json({
          success: false,
          error: 'Payment signature verification failed. Unauthorized or tampered transaction.',
        });
      }

      // 2. Prevent duplicate booking insertion if the same payment ID is already processed
      const existing = await findInquiryByRazorpayPaymentId(razorpay_payment_id);
      if (existing) {
        console.log('ℹ️ Payment ID already recorded in database:', razorpay_payment_id);
        return res.json({
          success: true,
          verified: true,
          data: existing,
          message: 'Payment has already been verified and booking confirmed.',
        });
      }

      // 3. Re-verify trip price securely on server
      const trip = await getTripById(tripId || 'kedarkantha-trek');
      let unitPrice = trip?.price || 8499;
      if (trip && departureCity && trip.departureCities) {
        const match = trip.departureCities.find(
          (c) => c.city.toLowerCase() === departureCity.toLowerCase() ||
                 c.city.toLowerCase().includes(departureCity.toLowerCase())
        );
        if (match && match.price) unitPrice = match.price;
      }

      const count = Math.max(1, Number(travelersCount) || 1);
      const calculatedPrice = unitPrice * count;
      const paidAmount = paymentType === 'full' ? calculatedPrice : 500 * count;

      // Unique Expedition Trip Booking ID
      const prefix = (trip?.title || tripTitle || 'EXP')
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3) || 'EXP';
      const tripBookingId = `RX-${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

      // 4. Record verified booking in Supabase / DB
      const confirmedBooking = await saveRazorpayBooking({
        tripBookingId,
        tripId: trip?.id || tripId || 'kedarkantha-trek',
        tripTitle: trip?.title || tripTitle || 'Kedarkantha Winter Snow Trek',
        name: name || 'Trekker',
        phone: phone || '',
        email: email || '',
        gender: gender || 'Male',
        dateOfBirth: dateOfBirth || '',
        age: age ? Number(age) : undefined,
        travelersCount: count,
        departureCity: departureCity || 'Dehradun',
        selectedMonth: selectedMonth || '',
        selectedDate: selectedDate || '',
        calculatedPrice,
        paidAmount,
        paymentStatus: 'Paid',
        paymentMethod: 'Razorpay Checkout',
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        message: message || '',
        status: 'Confirmed',
      });

      console.log('✅ Razorpay payment verified & seat booked:', confirmedBooking.tripBookingId);

      return res.status(201).json({
        success: true,
        verified: true,
        data: confirmedBooking,
        message: 'Payment verified and expedition seat officially reserved!',
      });
    } catch (err: any) {
      console.error('❌ Exception in /api/payment/verify:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Payment verification failed',
      });
    }
  });

  // Legacy manual UPI verification route - marked deprecated in favor of Razorpay
  app.post('/api/inquiries/verify-utr', async (req, res) => {
    try {
      const {
        tripBookingId,
        utrNumber,
        tripId,
        tripTitle,
        name,
        phone,
        email,
        gender,
        dateOfBirth,
        travelersCount,
        departureCity,
        selectedMonth,
        selectedDate,
        calculatedPrice,
        paidAmount,
        message,
      } = req.body;

      if (!utrNumber || typeof utrNumber !== 'string' || utrNumber.trim().length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid 12-digit UTR / UPI Transaction Reference Number from your payment receipt.',
        });
      }

      const verifiedRecord = await verifyAndSaveUtrInquiry({
        tripBookingId: tripBookingId || `RX-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
        tripId: tripId || 'kedarkantha-trek',
        tripTitle: tripTitle || 'Kedarkantha Winter Snow Trek',
        name: name || 'Trekker',
        phone: phone || '',
        email: email || '',
        gender: gender || 'Male',
        dateOfBirth: dateOfBirth || '',
        travelersCount: Number(travelersCount) || 1,
        departureCity: departureCity || 'Dehradun',
        selectedMonth: selectedMonth || '',
        selectedDate: selectedDate || '',
        calculatedPrice: Number(calculatedPrice) || 8499,
        paidAmount: Number(paidAmount) || 500,
        utrNumber: utrNumber.trim(),
        message: message || '',
      });

      res.status(201).json({
        success: true,
        data: verifiedRecord,
        verified: true,
        message: '₹500 token deposit verified & expedition pass issued!',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/inquiries/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentStatus } = req.body;
      const updated = await updateInquiryStatus(id, status, paymentStatus);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Inquiry not found' });
      }
      const all = await getInquiries();
      res.json({ success: true, data: updated, all });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // 5. Reviews Endpoints
  // ----------------------------------------------------
  app.get('/api/reviews', async (req, res) => {
    try {
      const tripId = typeof req.query.tripId === 'string' ? req.query.tripId : undefined;
      const reviews = await getReviews(tripId);
      res.json({ success: true, data: reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const { name, city, rating, comment, title, images, avatar, tripId, tripName } = req.body;
      if (!name || !comment || !rating) {
        return res.status(400).json({ success: false, error: 'Name, comment, and rating are required' });
      }

      const created = await createReview({
        name,
        city,
        rating,
        comment,
        title,
        images,
        avatar,
        tripId,
        tripName,
      });

      const all = await getReviews();
      res.status(201).json({ success: true, data: created, all });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/reviews/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteReview(id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Review not found or failed to delete' });
      }
      const all = await getReviews();
      res.json({ success: true, message: 'Review deleted permanently', data: all });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/reviews/:id/images/:imageIndex', async (req, res) => {
    try {
      const { id, imageIndex } = req.params;
      const idx = parseInt(imageIndex, 10);
      if (isNaN(idx)) {
        return res.status(400).json({ success: false, error: 'Invalid image index' });
      }

      const updated = await deleteReviewImage(id, idx);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Review or image not found' });
      }

      res.json({ success: true, data: updated, message: 'Review photo deleted permanently' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ----------------------------------------------------
  // 6. Gemini AI Expedition Guide Endpoint
  // ----------------------------------------------------
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history = [], tripContext } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      const allTrips = await getTrips();
      const activeTripData = tripContext || allTrips[0] || {};
      const ai = getGeminiClient();

      const systemInstruction = `You are the RoamX Chief AI Expedition Captain & Mountain Guide.
RoamX is India's leading youth trekking and adventure expeditions community (Support & Booking: Chat with Us at +91 6205054837, Official UPI ID: harshkumarsingh450-3@okicici).

Current Active Expedition in View:
- Title: ${activeTripData.title || 'Kedarkantha Winter Snow Trek'}
- Tagline: ${activeTripData.tagline || 'Himalayan Adventure'}
- Base Location: ${activeTripData.location || 'Uttarakhand'}
- Duration: ${activeTripData.duration || '5 Days / 4 Nights'} | Difficulty: ${activeTripData.difficulty || 'Easy to Moderate'}
- Base Price: ₹${activeTripData.price?.toLocaleString()}
- Key Highlights: ${(activeTripData.highlights || []).slice(0, 4).join(', ')}

All RoamX Available Trips:
Featured RoamX Expeditions & Circuits:
1. Kedarkantha Winter Snow Trek (12,500 ft, 5D/4N, Sankri Basecamp, Garhwal Himalayas, ₹8,499).
2. Spiti Valley Winter White 4x4 Expedition (15,050 ft, 8D/7N, Kaza, Key Monastery, Hikkim, Chicham Bridge, ₹21,999).
3. Kasol, Tosh & Kheerganga Natural Hot Spring Trek (9,700 ft, 4D/3N, Parvati Valley, Himachal, ₹5,499).
4. Triund Trek & Mcleodganj Camping (9,350 ft, 2D/1N, Dhauladhar Snow Wall, Kangra Valley, Dharamshala, ₹2,499).
5. Rishikesh, Mussoorie & Landour Combined Expedition (4D/3N, 16km River Rafting, Landour Bakehouse, Kempty Falls, ₹7,999).
6. Chakrata Unexplored Pine Paradise & Tiger Falls (9,500 ft, 3D/2N, 312ft Tiger Falls, Deoban Forest, Chilmiri Neck, ₹5,499).
7. Vrindavan & Mathura Heritage Spiritual Tour (2D/1N, Banke Bihari, Prem Mandir Light Show, Keshi Ghat Yamuna Aarti, ₹3,499).
8. Pushkar Desert Camping & Cultural Odyssey (3D/2N, Thar Desert Safari, Kalbelia Folk Dance, Brahma Temple, 52 Ghats, ₹4,999).
9. Varanasi (Kashi) Heritage & Spiritual Expedition (3D/2N, Grand Dashashwamedh Ganga Aarti Boat, Kashi Vishwanath Corridor, Sarnath, ₹5,999).
10. Badrinath Yatra & Mana India's Last Village Expedition (12,200 ft, 4D/3N, Lord Badri Vishal, Mana Village, Vasudhara 400ft Falls, Tapt Kund, ₹9,999).

RoamX Highlights & Booking Policies:
- ₹500 Token Deposit: Trekkers can lock their seat with a ₹500 token booking via UPI QR (harshkumarsingh450-3@okicici) or direct chat. Automated 12-digit UTR verification is performed for instant seat confirmation.
- 1 Seat per Booking: To ensure fair youth allocation, each booking is limited to 1 seat per transaction.
- Age & Eligibility: Strictly for youth aged 18 to 35 years. Male and female options with separate curated tents/homestay wings and dedicated safety captains.
- Safety First: WFR & BMC certified mountain leaders, microspikes, gaiters, 1:6 leader-to-trekker ratio, oxygen cylinders, pulse oximeters, and medical kits.
- Inclusions: Triple/double sharing cozy mountain tents/homestays, all 3 hot vegetarian mountain meals + morning tea & evening snacks, permits, transport from pickup hub.
- Support Contact: "Chat with Us" (+91 6205054837).

Tone & Rules:
- Be inspiring, knowledgeable, warm, and safety-conscious like a seasoned Himalayan guide. Supports Hindi, English, and Hinglish.
- Format responses cleanly with concise paragraphs and bullet points for readability.
- Explain altitude safety, gear lists, and ₹500 seat reservation clearly.`;

      if (ai) {
        try {
          // Format contents
          const contents: any[] = [];
          if (Array.isArray(history)) {
            for (const h of history.slice(-6)) {
              if (h.role && h.text) {
                contents.push({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text }],
                });
              }
            }
          }
          contents.push({
            role: 'user',
            parts: [{ text: message }],
          });

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: { systemInstruction },
          });

          const replyText = response.text || '';
          if (replyText.trim()) {
            const mapsPlaces: Array<{ title: string; uri: string }> = [];
            if (activeTripData.location) {
              mapsPlaces.push({
                title: `${activeTripData.location} Trailhead on Google Maps`,
                uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  activeTripData.location + ' Trek India'
                )}`,
              });
            }

            return res.json({
              success: true,
              reply: replyText,
              mapsPlaces,
              source: 'gemini-ai',
            });
          }
        } catch (geminiError) {
          console.warn('Gemini API call failed, using intelligent expedition fallback:', geminiError);
        }
      }

      // Fallback domain intelligence
      const lower = message.toLowerCase();
      let fallbackReply = `Hey explorer! 🏔️ Welcome to **RoamX Expeditions**.\n\nFor **${activeTripData.title}**, here is key information:\n- **Duration & Altitude**: ${activeTripData.duration} (Up to ${activeTripData.maxAltitude || activeTripData.location})\n- **Starting Price**: ₹${activeTripData.price?.toLocaleString()} with certified trek leaders, hot mountain meals, and winter gear included.\n- **Instant Seat Reservation**: Lock your seat with just **₹500 token deposit** via UPI (\`harshkumarsingh450-3@okicici\`) with automated UTR verification. Remaining balance is payable at basecamp.\n- **Eligibility**: Curated for youth aged **18 to 35 years**.\n\nAsk me about packing checklists, weather forecasts, pickup hubs, or click 'Chat with Us' for direct support!`;

      if (lower.includes('gear') || lower.includes('pack') || lower.includes('cloth') || lower.includes('shoe') || lower.includes('carry')) {
        fallbackReply = `🎒 **Recommended Himalayan Trekking Checklist for ${activeTripData.title}**:\n\n1. **Footwear**: Sturdy high-ankle trekking shoes with deep lug grip + 3 pairs of dry-fit socks + 1 pair woolen thermal socks.\n2. **Layering (3-layer rule)**: 2 quick-dry base tees, 1 warm fleece mid-layer, 1 windproof/waterproof down jacket (-5°C to -10°C rated).\n3. **Essentials**: 50-60L rucksack with rain cover, UV400 sunglasses, LED headlamp with spare batteries, quick-dry towel, 2x 1L water bottles / insulated flask.\n4. **Health**: Personal blister tape, Diamox (as advised by physician), lip balm, sunscreen (SPF 50+), and cold cream.\n\n*RoamX provides crampons/microspikes and gaiters free on all snow summit pushes!*`;
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('booking') || lower.includes('token') || lower.includes('500') || lower.includes('utr') || lower.includes('seat')) {
        fallbackReply = `💳 **RoamX 100% Automated ₹500 Seat Reservation Process**:\n\n- **Token Amount**: Pay just **₹500** per explorer to instantly lock your batch slot.\n- **Seat Policy**: Strict **1 seat per transaction** to keep youth expedition groups balanced (18-35 age eligibility).\n- **Payment Method**: Scan the official RoamX UPI QR code or transfer to UPI ID: \`harshkumarsingh450-3@okicici\`.\n- **Automated UTR Verification**: Enter your 12-digit bank UTR reference number in our booking portal for instant verification and generation of your **Expedition Pass**.\n- **Balance Settlement**: Pay the remaining balance upon arrival during the basecamp briefing.`;
      } else if (lower.includes('weather') || lower.includes('temperature') || lower.includes('best time') || lower.includes('season') || lower.includes('snow')) {
        fallbackReply = `⛅ **Trail Conditions & Weather for ${activeTripData.title}**:\n\n- **Daytime Temperatures**: 8°C to 15°C with crisp alpine air and clear mountain views.\n- **Night / Summit Temperature**: Drops to -2°C to -8°C at higher camps and basecamp.\n- **Best Season**: December to April for magical snow trails; May to October for vibrant alpine flora.\n- **Acclimatization**: Itinerary is scientifically paced for gradual elevation gain and maximum safety.`;
      } else if (lower.includes('age') || lower.includes('female') || lower.includes('women') || lower.includes('solo') || lower.includes('safety') || lower.includes('gender')) {
        fallbackReply = `🛡️ **Safety, Age & Solo Explorer Policy**:\n\n- **Age Bracket**: Curated strictly for youth aged **18 to 35 years** to ensure great group energy and peer pace.\n- **Female & Solo Travelers**: 45%+ of RoamX travelers are solo explorers, including solo female trekkers. We provide separate tenting/homestay arrangements for male and female participants.\n- **Certified Expedition Leads**: All teams are accompanied by Wilderness First Responder (WFR) and BMC certified leaders with emergency oxygen cylinders and first aid kits.`;
      } else if (lower.includes('pickup') || lower.includes('reach') || lower.includes('transport') || lower.includes('delhi') || lower.includes('dehradun')) {
        fallbackReply = `🚐 **Pickups & Multi-City Hubs for ${activeTripData.title}**:\n\n- **Dehradun Hub**: Pickup at 6:30 AM outside Dehradun Railway Station (Platform 1 exit).\n- **Delhi Hub**: Overnight AC Volvo / Tempo Traveller pickup from ISBT Kashmiri Gate, Delhi.\n- **Return Drop**: Travelers are dropped back safely at the pickup hub by evening on the final day.`;
      }

      return res.json({
        success: true,
        reply: fallbackReply,
        source: 'roamx-knowledge-base',
      });
    } catch (err: any) {
      console.error('Error in /api/ai/chat:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return app;
}
