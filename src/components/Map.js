import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

export default function Map({ userLocation, businesses, RADIUS_KM, CATEGORIES, store }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const L = require('leaflet');

    const map = L.map('touristMap').setView(
      [userLocation.lat, userLocation.lng],
      15
    );

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
      .bindPopup(`<strong>${userLocation.name}</strong>`);

    // 1km radius circle
    L.circle([userLocation.lat, userLocation.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.06,
      radius: RADIUS_KM * 1000,
      weight: 2
    }).addTo(map);

    // Business markers
    businesses.forEach(biz => {
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

      L.marker([biz.lat, biz.lng], { icon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    return () => map.remove();
  }, [userLocation, businesses, RADIUS_KM, CATEGORIES, store]);

  return <div id="touristMap" style={{width:'100%'}}></div>;
}
