// ==========================================
// TouristLab — Configuration
// Add/edit categories and cities here
// ==========================================

export const CITIES = {
  manchester: {
    id: 'manchester',
    name: 'Manchester City Centre',
    lat: 53.4808,
    lng: -2.2426
  }
  // ➕ Add more cities later:
  // london: { id: 'london', name: 'London', lat: ..., lng: ... }
};

export const CATEGORIES = [
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
  { id: 'takeaway', name: 'Takeaway', icon: '🥡' },
  { id: 'gym', name: 'Gym', icon: '💪' },
  { id: 'library', name: 'Library', icon: '📚' },
  { id: 'park', name: 'Park', icon: '🌳' },
  { id: 'gallery', name: 'Gallery', icon: '🎨' }
  // ➕ Add more categories anytime:
  // { id: 'cafe', name: 'Café', icon: '☕' },
  // { id: 'museum', name: 'Museum', icon: '🏛️' },
];

export const RADIUS_KM = 1.0;

export const STATUS = {
  PENDING: 'pending',
  BASIC: 'basic',      // Free — limited info only
  FULL: 'full',        // Paid — all info public
  REJECTED: 'rejected'
};
