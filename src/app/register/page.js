'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CITIES, CATEGORIES } from '../../lib/config';
import { BusinessStore } from '../../lib/store';

export default function RegisterPage() {
  const [store, setStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: '', city: '', address: '',
    lat: '', lng: '', phone: '', hours: '', website: '', description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { setStore(new BusinessStore()); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!store) return;

    store.add({
      name: formData.name,
      category: formData.category,
      city: formData.city,
      address: formData.address,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      phone: formData.phone,
      hours: formData.hours,
      website: formData.website,
      description: formData.description
    });

    setSubmitted(true);
    setFormData({
      name: '', category: '', city: '', address: '',
      lat: '', lng: '', phone: '', hours: '', website: '', description: ''
    });
  };

  return (
    <>
      <header className="tl-header">
        <div className="tl-container tl-header-inner">
          <div className="tl-brand">TouristLab · Register Business</div>
          <nav className="tl-nav">
            <Link href="/">← Discover</Link>
            <Link href="/register" className="active">Add Business</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="tl-section">
        <div className="tl-container" style={{maxWidth:'700px'}}>
          <h1 style={{textAlign:'center', marginBottom:'10px'}}>Register Your Business</h1>
          <p style={{textAlign:'center', color:'var(--tl-muted)', marginBottom:'30px'}}>
            Join TouristLab and be discovered by visitors. All listings are reviewed before publication.
          </p>

          {submitted && (
            <div style={{
              padding:'16px',
              background:'rgba(16,185,129,0.1)',
              border:'1px solid rgba(16,185,129,0.3)',
              borderRadius:'10px',
              color:'#6ee7b7',
              marginBottom:'24px',
              textAlign:'center'
            }}>
              ✅ Thank you! Your listing has been submitted and is pending review.
            </div>
          )}

          <form onSubmit={handleSubmit} className="tl-card">
            <div style={{marginBottom:'18px'}}>
              <label className="tl-label">Business Name *</label>
              <input type="text" name="name" className="tl-input" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="tl-grid-2" style={{marginBottom:'18px'}}>
              <div>
                <label className="tl-label">Category *</label>
                <select name="category" className="tl-select" value={formData.category} onChange={handleChange} required>
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="tl-label">City *</label>
                <select name="city" className="tl-select" value={formData.city} onChange={handleChange} required>
                  <option value="">Select...</option>
                  {Object.values(CITIES).map(city => (<option key={city.id} value={city.id}>{city.name}</option>))}
                </select>
              </div>
            </div>

            <div style={{marginBottom:'18px'}}>
              <label className="tl-label">Full Address *</label>
              <input type="text" name="address" className="tl-input" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="tl-grid-2" style={{marginBottom:'18px'}}>
              <div>
                <label className="tl-label">Latitude *</label>
                <input type="text" name="lat" className="tl-input" value={formData.lat} onChange={handleChange} required placeholder="e.g. 53.4808" />
              </div>
              <div>
                <label className="tl-label">Longitude *</label>
                <input type="text" name="lng" className="tl-input" value={formData.lng} onChange={handleChange} required placeholder="e.g. -2.2426" />
              </div>
            </div>

            <p style={{fontSize:'0.8rem', color:'var(--tl-muted)', marginBottom:'18px'}}>
              📍 Get coordinates: Right-click your location on Google Maps → "What's here?"
            </p>

            <div style={{marginBottom:'18px'}}>
              <label className="tl-label">Phone Number</label>
              <input type="tel" name="phone" className="tl-input" value={formData.phone} onChange={handleChange} />
            </div>

            <div style={{marginBottom:'18px'}}>
              <label className="tl-label">Opening Hours</label>
              <input type="text" name="hours" className="tl-input" value={formData.hours} onChange={handleChange} placeholder="e.g. Mon–Fri: 09:00 – 18:00" />
            </div>

            <div style={{marginBottom:'18px'}}>
              <label className="tl-label">Website / Menu Link</label>
              <input type="url" name="website" className="tl-input" value={formData.website} onChange={handleChange} placeholder="https://..." />
            </div>

            <div style={{marginBottom:'24px'}}>
              <label className="tl-label">Short Description</label>
              <textarea name="description" className="tl-textarea" rows="3" value={formData.description} onChange={handleChange}></textarea>
            </div>

            <button type="submit" className="tl-btn tl-btn-primary" style={{width:'100%'}}>
              Submit for Review
            </button>
          </form>

          <div style={{marginTop:'30px', padding:'16px', background:'rgba(59,130,246,0.05)', borderRadius:'10px', fontSize:'0.9rem'}}>
            <h4 style={{marginBottom:'8px'}}>📋 Listing Levels</h4>
            <p style={{color:'var(--tl-muted)', marginBottom:'4px'}}>
              <strong>🟡 Basic (Free):</strong> Name, category & description shown. Address, phone & contact details hidden.
            </p>
            <p style={{color:'var(--tl-muted)'}}>
              <strong>🔵 Full (Paid):</strong> All details visible — address, phone, website, hours & directions.
            </p>
          </div>
        </div>
      </main>

      <footer className="tl-footer">
        <div className="tl-container">
          <p>TouristLab · Discover What's Around You</p>
        </div>
      </footer>
    </>
  );
}
