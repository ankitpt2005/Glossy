import React from 'react';

export function AccountModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glossy-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-circle-lg">A</div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F1F1F', margin: 0 }}>Ankit Pandit</h3>
              <p style={{ fontSize: '13px', color: '#747775', margin: 0 }}>ankit.pandit@glossy.ai</p>
            </div>
          </div>
          <button className="icon-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="account-details-group" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="account-detail-card">
            <span className="detail-label">Gmail API Connection Status</span>
            <span className="status-badge-active">
              <span className="status-dot"></span> Connected & Authenticated
            </span>
          </div>

          <div className="account-detail-card">
            <span className="detail-label">Current Active Model</span>
            <span className="detail-value">Gemini 3.5 Flash (ADK Engine)</span>
          </div>

          <div className="account-detail-card">
            <span className="detail-label">Autonomous Safety Level</span>
            <span className="detail-value">High Guardrails (Auto-reply Low-Stakes Only)</span>
          </div>

          <div className="account-detail-card">
            <span className="detail-label">Deployment Environment</span>
            <span className="detail-value">Google Cloud Run (Pub/Sub Event Driven)</span>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="pill-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
