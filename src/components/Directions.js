'use client';

import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function Directions({ origin, destination, destinationName }) {
  const map = useMap();
  const [mode, setMode] = useState('walk');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const modes = [
    { id: 'walk', name: 'Walk', icon: '🚶', speed: 5 },
    { id: 'bike', name: 'Cycle', icon: '🚲', speed: 15 },
    { id: 'drive', name: 'Drive', icon: '🚗', speed: 35 },
  ];

  useEffect(() => {
    if (!origin || !destination) return;

    const getRoute = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(
          `https://routing.openstreetmap.de/routed-${mode}/route/v1/driving/` +
          `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
          `?overview=full&geometries=geojson&steps=true`
        );
        
        if (!res.ok) throw new Error('Route failed');
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          setRoute(data.routes[0]);
          
          // Draw line on map
          const geojson = data.routes[0].geometry;
          if (window.routeLayer) map.removeLayer(window.routeLayer);
          window.routeLayer = L.geoJSON(geojson, {
            color: '#22c55e',
            weight: 5,
            opacity: 0.8
          }).addTo(map);
          
          // Fit view
          const bounds = L.geoJSON(geojson).getBounds();
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        setError('Could not calculate route');
        console.error(err);
      }
      
      setLoading(false);
    };

    getRoute();
  }, [origin, destination, mode, map]);

  // Clear layer when unmounting
  useEffect(() => {
    return () => {
      if (window.routeLayer) map.removeLayer(window.routeLayer);
    };
  }, [map]);

  if (!origin || !destination) return null;

  const distanceKm = route ? (route.distance / 1000).toFixed(1) : '—';
  const durationMin = route ? Math.round(route.duration / 60) : '—';

  return (
    <div style={{
      padding: '16px',
      background: '#0f172a',
      borderTop: '1px solid #1e293b',
      maxHeight: '300px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, color: '#f8fafc' }}>Directions → {destinationName}</h4>
        <button
          onClick={() => { if (window.routeLayer) map.removeLayer(window.routeLayer); setRoute(null); }}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >✕</button>
      </div>

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: mode === m.id ? '#22c55e' : '#1e293b',
              color: mode === m.id ? '#000' : '#cbd5e1',
              cursor: 'pointer',
              fontWeight: mode === m.id ? 600 : 400
            }}
          >
            {m.icon} {m.name}
          </button>
        ))}
      </div>

      {/* Result */}
      {loading && <p style={{ color: '#94a3b8' }}>Calculating route…</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {route && !loading && (
        <div>
          <p style={{ color: '#e2e8f0', margin: '4px 0' }}>
            📍 {distanceKm} km &nbsp;|&nbsp; ⏱️ ~{durationMin} min
          </p>
          {route.legs?.[0]?.steps && (
            <ol style={{ paddingLeft: '20px', margin: '10px 0', color: '#cbd5e1' }}>
              {route.legs[0].steps.map((step, i) => (
                <li key={i} style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                  {step.maneuver?.instruction || step.name}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
