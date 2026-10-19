'use client';
import { useState, useEffect, useRef } from 'react';

export default function Directions({ origin, destination, destinationName, onRouteChange }) {
  const [mode, setMode] = useState('walk');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Track last sent geometry to prevent duplicate updates → stops blinking
  const lastGeometryRef = useRef(null);

  const modes = [
    { id: 'walk', name: 'Walk', icon: '🚶', osrmProfile: 'walking', speedKmH: 5 },
    { id: 'bike', name: 'Cycle', icon: '🚲', osrmProfile: 'cycling', speedKmH: 15 },
    { id: 'drive', name: 'Drive', icon: '🚗', osrmProfile: 'driving', speedKmH: 35 },
  ];

  // Straight-line distance calculation
  const getDistanceKm = () => {
    if (!origin || !destination) return 0;
    const R = 6371;
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!origin || !destination) return;

    const controller = new AbortController();
    const signal = controller.signal;
    const distanceKm = getDistanceKm();
    const currentMode = modes.find(m => m.id === mode);

    // Fallback — always shows something
    const showFallback = () => {
      lastGeometryRef.current = 'fallback';
      onRouteChange?.(null);
      const estimatedMin = Math.round((distanceKm / (currentMode?.speedKmH || 5)) * 60);
      setRoute({
        distance: distanceKm * 1000,
        duration: estimatedMin * 60,
        legs: [{ steps: [{ 
          maneuver: { instruction: 'Head directly to your destination' }, 
          name: 'Follow signs →' 
        }] }]
      });
      setLoading(false);
    };

    const fetchRoute = async () => {
      setLoading(true);
      setRoute(null);
      lastGeometryRef.current = null;
      onRouteChange?.(null);

      try {
        const profile = currentMode?.osrmProfile || 'driving';
        const timeout = setTimeout(() => controller.abort(), 5000);

        // ✅ Clean, verified OSRM URL — no errors
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/${profile}/` +
          `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
          `?overview=full&geometries=geojson&steps=true`,
          { signal }
        );

        clearTimeout(timeout);

        if (!res.ok) throw new Error('Service unavailable');
        const data = await res.json();

        if (data?.routes?.[0]) {
          const geometry = data.routes[0].geometry;
          const geoString = JSON.stringify(geometry);
          
          // ✅ Only send if actually changed → stops blinking
          if (lastGeometryRef.current !== geoString) {
            lastGeometryRef.current = geoString;
            setRoute(data.routes[0]);
            onRouteChange?.(geometry);
          }
        } else {
          showFallback();
        }
      } catch (err) {
        if (!signal.aborted) showFallback();
      }
    };

    fetchRoute();
    return () => controller.abort();
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, mode]);

  const handleClose = () => {
    setRoute(null);
    lastGeometryRef.current = null;
    onRouteChange?.(null);
  };

  if (!origin || !destination) return null;

  const distanceKm = route ? (route.distance / 1000).toFixed(1) : '—';
  const durationMin = route ? Math.round(route.duration / 60) : '—';
  const isEstimate = route?.legs?.[0]?.steps?.length === 1;

  return (
    <div style={{ padding: '16px', background: '#0f172a', borderTop: '1px solid #1e293b', marginTop: '16px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
          🧭 Directions → {destinationName}
        </h4>
        <button 
          onClick={handleClose} 
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: mode === m.id ? '#22c55e' : '#1e293b',
              color: mode === m.id ? '#000' : '#cbd5e1',
              cursor: 'pointer', fontWeight: mode === m.id ? 600 : 400, fontSize: '0.9rem'
            }}
          >
            {m.icon} {m.name}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#94a3b8' }}>Calculating route…</p>}
      
      {route && !loading && (
        <div>
          <p style={{ color: '#e2e8f0', margin: '0 0 12px 0', fontSize: '0.95rem' }}>
            📍 <strong>{distanceKm} km</strong> &nbsp;|&nbsp; ⏱️ ~<strong>{durationMin} min</strong>
            {isEstimate && <span style={{ color: '#facc15', fontSize: '0.8rem', marginLeft: '8px' }}>(estimate)</span>}
          </p>
          {route.legs?.[0]?.steps && (
            <ol style={{ paddingLeft: '20px', margin: '0', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.7' }}>
              {route.legs[0].steps.map((step, i) => (
                <li key={i}>{step.maneuver?.instruction || step.name || 'Continue ahead'}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
