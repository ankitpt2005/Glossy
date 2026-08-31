import React, { useState } from 'react';

export function SettingsModal({ onClose, onClearHistory }) {
  const [autoSend, setAutoSend] = useState(true);
  const [sessionLen, setSessionLen] = useState('60');
  const [model, setModel] = useState('Glossy Flash 3.5');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleClear = () => {
    onClearHistory();
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glossy-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F1F1F', margin: 0 }}>
            ⚙️ Glossy Agent Settings
          </h3>
          <button className="icon-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Setting item 1 */}
          <div className="setting-row">
            <div>
              <div className="setting-title">Auto-Reply for Low-Stakes Emails</div>
              <div className="setting-desc">Automatically reply to casual lunch/thank-you notes during busy sessions</div>
            </div>
            <label className="switch-toggle">
              <input type="checkbox" checked={autoSend} onChange={e => setAutoSend(e.target.checked)} />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Setting item 2 */}
          <div className="setting-row">
            <div>
              <div className="setting-title">Default Guardrail Duration</div>
              <div className="setting-desc">Standard duration when starting a new focus session</div>
            </div>
            <select 
              className="settings-select"
              value={sessionLen} 
              onChange={e => setSessionLen(e.target.value)}
            >
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes</option>
              <option value="90">90 Minutes</option>
              <option value="120">120 Minutes</option>
            </select>
          </div>

          {/* Setting item 3 */}
          <div className="setting-row">
            <div>
              <div className="setting-title">Default AI Model</div>
              <div className="setting-desc">Gemini ADK model for triage, extraction & drafting</div>
            </div>
            <select 
              className="settings-select"
              value={model} 
              onChange={e => setModel(e.target.value)}
            >
              <option value="Glossy Flash 3.5">Glossy Flash 3.5 (Fastest)</option>
              <option value="Glossy Pro 3.5">Glossy Pro 3.5 (Deep Reasoning)</option>
            </select>
          </div>

          {/* Danger Zone / Delete Section */}
          <div className="danger-zone-card">
            <div>
              <div style={{ fontWeight: 700, color: '#B91C1C', fontSize: '14px' }}>🗑️ Delete & Clear Section</div>
              <div className="setting-desc">Purge all local activity logs, extracted commitments, and past session reports</div>
            </div>
            {!showConfirmDelete ? (
              <button className="btn-danger" onClick={() => setShowConfirmDelete(true)}>
                Clear All Logs
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-danger" onClick={handleClear}>Confirm</button>
                <button className="pill-btn-secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="pill-btn-primary" onClick={onClose}>Save & Close</button>
        </div>
      </div>
    </div>
  );
}
