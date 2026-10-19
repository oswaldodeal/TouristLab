'use client';

import { CITIES, CATEGORIES, STATUS } from './config';

const STORAGE_KEY = 'touristlab_data_v2';

// Sample Manchester businesses
const initialData = [
  {
    id: 'sample-mcr-1',
    name: 'Northern Soul Café',
    category: 'restaurant',
    city: 'manchester',
    address: '42 Oldham Street, Manchester',
    lat: 53.4815,
    lng: -2.2370,
    phone: '0161 123 4567',
    hours: 'Mon–Sun: 09:00 – 22:00',
    website: 'https://example.com/northernsoul',
    description: 'Independent café serving local produce in the Northern Quarter.',
    status: STATUS.FULL,
    submittedAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'sample-mcr-2',
    name: 'Piccadilly Gardens',
    category: 'park',
    city: 'manchester',
    address: 'Piccadilly, Manchester',
    lat: 53.4802,
    lng: -2.2362,
    phone: 'N/A',
    hours: 'Dawn to Dusk, Daily',
    website: '',
    description: 'Central public gardens and green space.',
    status: STATUS.BASIC,
    submittedAt: '2026-10-01T10:00:00Z'
  },
    {
    id: 'sample-mcr-3',
    name: 'Manchester Art Gallery',
    category: 'gallery',
    city: 'manchester',
    address: 'Mosley Street, Manchester, M2 3JL',
    lat: 53.48071,   // ✅ Exact Mosley St entrance
    lng: -2.24263,   // ✅ Exact Mosley St entrance
    phone: '0161 235 8888',
    hours: 'Tue–Sun: 10:00 – 17:00',
    website: 'https://manchesterartgallery.org',
    description: 'Public art gallery with historic and contemporary collections.',
    status: STATUS.FULL,
    submittedAt: '2026-10-01T10:00:00Z'
  }
];
export class BusinessStore {
  constructor() {
    this.businesses = [];
    this.load();
  }

  load() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.businesses = JSON.parse(stored);
    } else {
      this.businesses = [...initialData];
      this.save();
    }
  }

  save() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.businesses));
  }

  getAll() { return this.businesses; }

  getForPublic(cityId = null) {
    return this.businesses.filter(b => {
      const visible = b.status === STATUS.BASIC || b.status === STATUS.FULL;
      const matchesCity = !cityId || b.city === cityId;
      return visible && matchesCity;
    });
  }

  getPending() { return this.businesses.filter(b => b.status === STATUS.PENDING); }
  getVerified() { return this.businesses.filter(b => b.status === STATUS.BASIC || b.status === STATUS.FULL); }
  getRejected() { return this.businesses.filter(b => b.status === STATUS.REJECTED); }

  add(business) {
    const newBiz = {
      id: 'biz-' + Date.now(),
      ...business,
      status: STATUS.PENDING,
      submittedAt: new Date().toISOString()
    };
    this.businesses.push(newBiz);
    this.save();
    return newBiz;
  }

  updateStatus(id, newStatus) {
    const biz = this.businesses.find(b => b.id === id);
    if (biz) {
      biz.status = newStatus;
      biz.reviewedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  delete(id) {
    this.businesses = this.businesses.filter(b => b.id !== id);
    this.save();
  }

  // Visibility rules — Basic = limited info only
  getPublicView(business) {
    const isFull = business.status === STATUS.FULL;
    return {
      id: business.id,
      name: business.name,
      category: business.category,
      description: business.description,
      distance: business.distance,
      city: business.city,
      lat: business.lat,
      lng: business.lng,
      // Full info only visible when Fully Verified
      ...(isFull && {
        address: business.address,
        phone: business.phone,
        hours: business.hours,
        website: business.website
      }),
      isFullVerified: isFull
    };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(2)}km`;
  }

  clearAll() {
    if (confirm('⚠️ Reset all data to defaults?')) {
      localStorage.removeItem(STORAGE_KEY);
      this.businesses = [...initialData];
      this.save();
      return true;
    }
    return false;
  }
}
