'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES, STATUS } from '../../lib/config';
import { BusinessStore } from '../../lib/store';

export default function AdminPage() {
  const [store, setStore] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [, setRefresh] = useState(0);

  useEffect(() => { setStore(new BusinessStore()); }, []);

  if (!store) return <div className="tl-container" style={{padding:'40px',textAlign:'center'}}>Loading...</div>;

  const pending = store.getPending();
  const verified = store.getVerified();
  const rejected = store.getRejected();

  const handleStatusChange = (id, newStatus) => {
    store.updateStatus(id, newStatus);
    setRefresh(n => n + 1);
  };

  const handleDelete = (id) => {
    if (confirm('Permanently delete this listing?')) {
      store.delete(id);
      setRefresh(n => n + 1);
    }
  };

  const handleClear = () => {
    if (store.clearAll()) setRefresh(n => n + 1);
  };

  const renderList = (list) => (
    <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
      {list.length === 0 ? (
        <p style={{color:'var(--tl-muted)', textAlign:'center', padding:'30px'}}>No listings here.</p>
      ) : list.map(biz => {
        const cat = CATEGORIES.find(c => c.id === biz.category);
        return (
          <div key={biz.id} className="tl-card">
            <h3 style={{marginBottom:'8px'}}>{cat?.icon || '📍'} {biz.name}</h3>
            <p style={{fontSize:'0.85rem', color:'var(--tl-muted)', marginBottom:'4px'}}><strong>Category:</strong> {cat?.name || biz.category}</p>
            <p style={{fontSize:'0.85rem', color:'var(--tl-muted)', marginBottom:'4px'}}><strong>City:</strong> {biz.city}</p>
            <p style={{fontSize:'0.85rem', color:'var(--tl-muted)', marginBottom:'4px'}}><strong>Address:</strong> {biz.address}</p>
            <p style={{fontSize:'0.85rem', color:'var(--tl-muted)', marginBottom:'4px'}}><strong>Coordinates:</strong> {biz.lat}, {biz.lng}</p>
            {biz.phone && <p style={{fontSize:'0.85rem', color:'var(--tl-muted)', marginBottom:'4px'}}><strong>Phone:</strong> {biz.phone}</p>}
            <p style={{fontSize:'0.8rem', color:'var(--tl-muted)', marginTop:'8px'}}>Submitted: {new Date(biz.submittedAt).toLocaleString()}</p>
            <p style={{marginTop:'6px', fontWeight:'600'}} className={`tl-status-${biz.status}`}>
              Status: {biz.status.charAt(0).toUpperCase() + biz.status.slice(1)}
            </p>

            <div style={{marginTop:'14px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
              {biz.status === STATUS.PENDING && (
                <>
                  <button className="tl-btn" style={{background:'rgba(245,158,11,0.15)', color:'#fcd34d', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                    onClick={() => handleStatusChange(biz.id, STATUS.BASIC)}>✅ Approve (Basic)</button>
                  <button className="tl-btn" style={{background:'rgba(16,185,129,0.15)', color:'#6ee7b7', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                    onClick={() => handleStatusChange(biz.id, STATUS.FULL)}>✅ Approve (Full)</button>
                  <button className="tl-btn" style={{background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                    onClick={() => handleStatusChange(biz.id, STATUS.REJECTED)}>❌ Reject</button>
                </>
              )}
              {biz.status === STATUS.BASIC && (
                <>
                  <button className="tl-btn" style={{background:'rgba(16,185,129,0.15)', color:'#6ee7b7', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                    onClick={() => handleStatusChange(biz.id, STATUS.FULL)}>⬆️ Upgrade to Full</button>
                  <button className="tl-btn" style={{background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                    onClick={() => handleStatusChange(biz.id, STATUS.REJECTED)}>❌ Reject</button>
                </>
              )}
              {biz.status === STATUS.FULL && (
                <button className="tl-btn" style={{background:'rgba(245,158,11,0.15)', color:'#fcd34d', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                  onClick={() => handleStatusChange(biz.id, STATUS.BASIC)}>⬇️ Downgrade to Basic</button>
              )}
              {biz.status === STATUS.REJECTED && (
                <button className="tl-btn" style={{background:'rgba(16,185,129,0.15)', color:'#6ee7b7', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                  onClick={() => handleStatusChange(biz.id, STATUS.BASIC)}>✅ Approve as Basic</button>
              )}
              <button className="tl-btn" style={{background:'rgba(148,163,184,0.15)', color:'#94a3b8', border:'none', padding:'8px 14px', fontSize:'0.85rem'}}
                onClick={() => handleDelete(biz.id)}>🗑️ Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <header className="tl-header" style={{borderBottom:'2px solid var(--tl-warning)'}}>
        <div className="tl-container tl-header-inner">
          <div className="tl-brand">TouristLab · Admin Review Panel 🔒</div>
          <nav className="tl-nav">
            <Link href="/">← Public Site</Link>
            <Link href="/register">Add Business</Link>
            <Link href="/admin" className="active">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="tl-section">
        <div className="tl-container">
          <h1 style={{marginBottom:'8px'}}>Business Listing Review</h1>
          <p style={{color:'var(--tl-muted)', marginBottom:'30px'}}>
            <strong>Basic:</strong> Name & description only visible · <strong>Full:</strong> All contact & location details public
          </p>

          <div style={{display:'flex', gap:'8px', marginBottom:'30px', flexWrap:'wrap', borderBottom:'1px solid var(--tl-border)', paddingBottom:'1px'}}>
            {['pending', 'verified', 'rejected'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="tl-btn"
                style={{
                  background: 'transparent',
                  color: activeTab === tab ? 'var(--tl-primary)' : 'var(--tl-muted)',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--tl-primary)' : '2px solid transparent',
                  borderRadius: '0',
                  padding: '10px 20px'
                }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{background:'rgba(59,130,246,0.2)', padding:'2px 8px', borderRadius:'10px', fontSize:'0.75rem', marginLeft:'6px'}}>
                  {tab === 'pending' ? pending.length : tab === 'verified' ? verified.length : rejected.length}
                </span>
              </button>
            ))}
            <button onClick={handleClear} className="tl-btn" style={{marginLeft:'auto', color:'var(--tl-danger)', background:'transparent', border:'none'}}>
              ⚠️ Clear All
            </button>
          </div>

          {activeTab === 'pending' && renderList(pending)}
          {activeTab === 'verified' && renderList(verified)}
          {activeTab === 'rejected' && renderList(rejected)}
        </div>
      </main>

      <footer className="tl-footer">
        <div className="tl-container">
          <p>TouristLab · Admin Panel — Restricted Access</p>
        </div>
      </footer>
    </>
  );
}
