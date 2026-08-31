import React, { useState } from 'react';

export function HistoryDrawer({ isOpen, onClose, activities, onDeleteActivity }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredActivities = activities.filter(act => 
    (act.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (act.sender || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (act.reasoning || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🕙</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F1F1F', margin: 0 }}>
              Previous Sessions & Triage History
            </h3>
          </div>
          <button className="icon-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-search">
          <input
            type="text"
            placeholder="Search past emails, senders, or actions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="drawer-search-input"
          />
        </div>

        <div className="drawer-body">
          {filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#747775' }}>
              No history entries found matching your search.
            </div>
          ) : (
            filteredActivities.map((act, index) => (
              <div key={act.id || index} className="history-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 600, color: '#1F1F1F', fontSize: '14px' }}>
                    {act.subject || 'Triaged Email'}
                  </div>
                  <button 
                    className="delete-item-btn"
                    title="Delete Entry"
                    onClick={() => onDeleteActivity(act.id || index)}
                  >
                    🗑️
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#4B5563', marginBottom: '6px' }}>
                  From: {act.sender || 'Unknown Sender'}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic', marginBottom: '8px' }}>
                  "{act.reasoning || act.snippet || 'Triaged by Glossy Agent'}"
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge-pill badge-${act.action || 'info'}`}>
                    {act.action === 'auto_sent' ? '⚡ Auto-Replied' : '🛡️ Flagged for Review'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    {act.timestamp ? new Date(act.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
