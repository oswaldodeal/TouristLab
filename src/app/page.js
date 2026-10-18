'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CITIES, CATEGORIES, RADIUS_KM, STATUS } from '../lib/config';
import { BusinessStore } from '../lib/store';

const MapWithNoSSR = dynamic(() => import('../components/Map'), { ssr: false });

export default function HomePage() {
  const [store, setStore] = useState(null);
  const [selectedCity, setSelectedCity] = useState('manchester');
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    setStore(new BusinessStore());
    setUserLocation(CITIES.manchester);
  }, []);

  useEffect(() => {
    if (!store || !selectedCity) return;
    const city = CITIES[selectedCity];
    setUserLocation(city);

    let list = store.getForPublic(selectedCity).map(biz => {
      biz.distance = store.calculateDistance(
        city.lat, city.lng, biz.lat, biz.lng
      );
      return biz;
    }).filter(biz => biz.distance <= RADIUS_KM);

    if (categoryFilter !== 'all') {
      list = list.filter(biz => biz.category === categoryFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(biz =>
        biz.name.toLowerCase().includes(term) ||
        biz.description?.toLowerCase().includes(term)
      );
    }

    list.sort((a, b) => a.distance - b.distance);
    setBusinesses(list);
  }, [store, selectedCity, searchTerm, categoryFilter]);

  if (!store) return <div className="tl-container" style={{padding:'40px',textAlign:'center'}}>Loading...</div>;

  return (
    <>
      <header className="tl-header">
        <div className="tl-container tl-header-inner">
          <div className="tl-brand">TouristLab · Discover What's Around You</div>
          <nav className="tl-nav">
            <Link href="/" className="active">Discover</Link>
            <Link href="/register">Add Your Business</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="tl-section tl-intro">
          <div className="tl-container">
            <h1>Discover What's Around You</h1>
            <p className="tl-lead">Find restaurants, takeaways, gyms, libraries, parks and galleries — all within 1km of Manchester City Centre.</p>
          </div>
        </section>

        <section className="tl-section" style={{paddingTop:'10px', paddingBottom:'20px'}}>
          <div className="tl-container">
            <div className="tl-card" style={{marginBottom:'20px'}}>
              <h3 style={{marginBottom:'12px'}}>📍 Select Your Area</h3>
              <select
                className="tl-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{maxWidth:'400px'}}
              >
                {Object.values(CITIES).map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <p style={{marginTop:'10px', color:'var(--tl-muted)', fontSize:'0.9rem'}}>
                Showing results within <strong>{RADIUS_KM}km</strong> of {CITIES[selectedCity].name}
              </p>
            </div>

            <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'20px'}}>
              <input
                type="text"
                className="tl-input"
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{flex:1, minWidth:'250px'}}
              />
              <select
                className="tl-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{minWidth:'180px'}}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            {userLocation && (
              <MapWithNoSSR
                userLocation={userLocation}
                businesses={businesses}
                RADIUS_KM={RADIUS_KM}
                CATEGORIES={CATEGORIES}
                store={store}
              />
            )}
          </div>
        </section>

        <section className="tl-section" style={{paddingTop:'30px'}}>
          <div className="tl-container">
            <h2>Nearby Places</h2>
            {businesses.length === 0 ? (
              <p style={{color:'var(--tl-muted)', textAlign:'center', padding:'40px'}}>
                No places found within {RADIUS_KM}km. Try broadening your search.
              </p>
            ) : (
              <div className="tl-grid">
                {businesses.map(biz => {
                  const view = store.getPublicView(biz);
                  const cat = CATEGORIES.find(c => c.id === biz.category);
                  return (
                    <div key={biz.id} className="tl-card">
                      <span style={{
                        display:'inline-block',
                        background:'rgba(59,130,246,0.15)',
                        color:'#93c5fd',
                        fontSize:'0.8rem',
                        padding:'3px 10px',
                        borderRadius:'12px',
                        marginBottom:'10px'
                      }}>
                        {cat?.icon || '📍'} {cat?.name || biz.category}
                      </span>
                      <h3 style={{marginBottom:'6px', color:'#fff'}}>{view.name}</h3>
                      <p style={{color:'var(--tl-success)', fontWeight:'600', fontSize:'0.9rem', marginBottom:'10px'}}>
                        📍 {store.formatDistance(biz.distance)} away
                      </p>
                      <p style={{fontSize:'0.88rem', color:'var(--tl-muted)', marginBottom:'10px'}}>
                        {view.description}
                      </p>

                      {view.isFullVerified ? (
                        <>
                          {view.address && <p style={{fontSize:'0.85rem'}}><strong>Address:</strong> {view.address}</p>}
                          {view.phone && <p style={{fontSize:'0.85rem'}}><strong>Phone:</strong> {view.phone}</p>}
                          {view.hours && <p style={{fontSize:'0.85rem'}}><strong>Hours:</strong> {view.hours}</p>}
                          {view.website && (
                            <p style={{marginTop:'8px'}}>
                              <a href={view.website} target="_blank" rel="noreferrer" style={{color:'var(--tl-primary)'}}>
                                Visit Website →
                              </a>
                            </p>
                          )}
                          <p style={{marginTop:'10px'}}>
  <a
    href={`https://www.google.com/maps/dir/?api=1&destination=${biz.lat},${biz.lng}&dir_action=navigate`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display:'inline-block',
      background:'rgba(59,130,246,0.15)',
      padding:'8px 14px',
      borderRadius:'8px',
      color:'#93c5fd',
      textDecoration:'none',
      fontSize:'0.9rem',
      marginRight:'12px'
    }}
  >
    🚶 Get Directions
  </a>

  <a
    href="/"
    style={{
      display:'inline-block',
      background:'rgba(34,197,94,0.15)',
      padding:'8px 14px',
      borderRadius:'8px',
      color:'#86efac',
      textDecoration:'none',
      fontSize:'0.9rem',
      fontWeight:'500'
    }}
  >
    ← Back to Discover
  </a>
</p>
                        </>
                      ) : (
                        <p style={{color:'var(--tl-warning)', fontSize:'0.85rem', marginTop:'10px'}}>
                          ⭐ Full contact details available once upgraded
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="tl-footer">
        <div className="tl-container">
          <p>TouristLab · Discover What's Around You</p>
        </div>
      </footer>
    </>
  );
}
