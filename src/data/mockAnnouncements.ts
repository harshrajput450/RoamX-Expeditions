import { AnnouncementStrip } from '../types';

export const initialAnnouncements: AnnouncementStrip[] = [
  {
    id: 'ann-1',
    text: '🔥 LOCK YOUR EXPEDITION SEAT WITH JUST ₹500 TOKEN DEPOSIT | BALANCE PAYABLE AT BASECAMP | EARLY BIRD BATCHES OPEN!',
    link: '#booking-section',
    badge: 'EXCLUSIVE OFFER',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ann-2',
    text: '❄️ KEDARKANTHA & SPITI WINTER EXPEDITION BATCHES ARE NOW LIVE - LIMITED 14 SEATS PER GROUP!',
    link: '#batches-section',
    badge: 'FILLING FAST',
    isActive: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ann-3',
    text: '⛰️ 100% REFUND GUARANTEE ON CANCELLATION 15 DAYS PRIOR TO TRIP START DATE!',
    link: '#inclusions-section',
    badge: 'SAFE TRAVEL',
    isActive: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'ann-4',
    text: '🎒 FREE RENTAL TREK POLES & PONCHO INCLUDED ON ALL GARHWAL HIMALAYAS EXPEDITIONS!',
    link: '#things-to-carry',
    badge: 'FREE GEAR',
    isActive: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];
