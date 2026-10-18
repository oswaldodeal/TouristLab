'use client';

import { useState, useEffect } from 'react';

export default function Directions({ origin, destination, destinationName }) {
  const [mode, setMode] = useState('walk');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const modes = [
    { id: 'walk', name: 'Walk', icon: '🚶' },
    { id: 'bike', name: 'Cycle', icon: '🚲' },
    { id: 'drive', name: 'Drive', icon: '🚗' },
  ];

  useEffect(() => {
    if (!origin || !destination) return;

    const getRoute = async () => {
      setLoading(true);
      setError(null);
      setRoute(null);
      
      try {
        const res = await fetch(
          `https://routing.openstreetmap.de/routed-${mode}/route/v1/driving/` +
          `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
          `?overview=full&geometries=geojson&steps=true`
        );
        
        if (!res.ok) throw new Error('Route service unavailable');
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          setRoute(data.routes[0]);
        } else {
          throw new Error('No route found');
        }
      } catch (err) {
        setError('Could not calculate directions. Please try again.');
        console.error('Directions error:', err);
      }
      
      setLoading(false);
    };

    getRoute();
  }, [origin, destination, mode]);

  if (!origin || !destination) return null;

  const distanceKm = route ? (route.distance / 1000).toFixed(1) : '—';
  const durationMin = route ? Math.round(route.duration / 60) : '—';

  return (
    <div style={{
      padding: '16px',
      background: '#0f172a',
      borderTop: '1px solid #1e293b',
      marginTop: '16px',
      borderRadius: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
          🧭 Directions → {destinationName}
        </h4>
        <button
          onClick={() => {
            setRoute(null);
            setError(null);
          }}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#94a3b8', 
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: mode === m.id ? '#22c55e' : '#1e293b',
              color: mode === m.id ? '#000' : '#cbd5e1',
              cursor: 'pointer',
              fontWeight: mode === m.id ? 600 : 400,
              fontSize: '0.9rem'
            }}
          >
            {m.icon} {m.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && <p style={{ color: '#94a3b8' }}>Calculating route…</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      
      {route && !loading && (
        <div>
          <p style={{ color: '#e2e8f0', margin: '0 0 12px 0', fontSize: '0.95rem' }}>
            📍 <strong>{distanceKm} km</strong> &nbsp;|&nbsp; ⏱️ ~<strong>{durationMin} min</strong>
          </p>
          
          {route.legs?.[0]?.steps && (
            <ol style={{ 
              paddingLeft: '20px', 
              margin: '0', 
              color: '#cbd5e1',
              fontSize: '0.9rem',
              lineHeight: '1.7'
            }}>
              {route.legs[0].steps.map((step, i) => (
                <li key={i}>
                  {step.maneuver?.instruction || step.name || 'Continue ahead'}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
