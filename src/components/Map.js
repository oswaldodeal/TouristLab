import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BusinessStore } from '../lib/store';

export default function Map({ userLocation, businesses, RADIUS_KM, CATEGORIES, store, routeGeoJSON }) {
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const routeGeoJSONRef = useRef(null);
  const businessesRef = useRef(null);
  const circleRef = useRef(null);

  // Initialize map — ONLY runs when userLocation truly changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userLocation) return;

    // Prevent duplicate map creation
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create map
    const map = L.map('touristMap').setView(
      [userLocation.lat, userLocation.lng],
      15
    );
    mapRef.current = map;

    // Base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Centre marker
    const centreIcon = L.divIcon({
      html: '<div style="font-size:28px; text-align:center;">📍</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker([userLocation.lat, userLocation.lng], { icon: centreIcon })
      .addTo(map)
      .bindPopup(`<strong>${userLocation.name || 'Your Location'}</strong>`);

    // 1km radius circle
    circleRef.current = L.circle([userLocation.lat, userLocation.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.06,
      radius: RADIUS_KM * 1000,
      weight: 2
    }).addTo(map);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      businessesRef.current = null;
      routeGeoJSONRef.current = null;
    };
  }, [userLocation?.lat, userLocation?.lng, RADIUS_KM]);

  // Update businesses ONLY — separate from map init
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old business markers
    if (businessesRef.current) {
      businessesRef.current.forEach(marker => mapRef.current.removeLayer(marker));
    }
    
    // Add new business markers
    businessesRef.current = businesses.map(biz => {
      const cat = CATEGORIES.find(c => c.id === biz.category);
      const iconHtml = cat?.icon || '📍';
      const icon = L.divIcon({
        html: `<div style="font-size:22px; text-align:center;">${iconHtml}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const popupContent = `
        <strong>${biz.name}</strong><br>
        ${store.formatDistance(biz.distance)} away
        ${biz.status === 'basic' ? '<br><em style="color:orange">Basic listing</em>' : ''}
      `;
      return L.marker([biz.lat, biz.lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(popupContent);
    });
  }, [businesses, CATEGORIES, store]);

  // ✅ Green route line — NO BLINKING VERSION
  useEffect(() => {
    if (!mapRef.current || !routeGeoJSON) return;

    const geoJsonString = JSON.stringify(routeGeoJSON);
    
    // Same route = do nothing → stops blinking ✅
    if (routeGeoJSONRef.current === geoJsonString) {
      return;
    }

    routeGeoJSONRef.current = geoJsonString;

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    routeLayerRef.current = L.geoJSON(routeGeoJSON, {
      style: {
        color: '#22c55e',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }
    }).addTo(mapRef.current);

    const bounds = routeLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, {
        padding: [60, 60],
        animate: false
      });
    }
  }, [routeGeoJSON]);

  return <div id="touristMap" style={{ width: '100%', height: '500px' }}></div>;
}
