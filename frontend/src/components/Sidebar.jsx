import React, { useState, useEffect } from 'react';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  activeSession, 
  onStartSession, 
  onEndSession,
  onOpenSimulator 
}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSessionMenu, setShowSessionMenu] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const startTime = activeSession.start_time || (Date.now() / 1000);
      const durationMins = activeSession.duration_minutes || 30;
      const expectedEnd = activeSession.expected_end_time || (startTime + (durationMins * 60));
      const now = Date.now() / 1000;
      const remaining = Math.max(0, Math.floor(expectedEnd - now));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimeLeft = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="slim-sidebar-container">
      {/* Top Gemini Sparkle Star Logo with Glossy Tooltip */}
      <div className="slim-top">
        <div 
          className="gemini-sparkle-logo" 
          title="Glossy AI — Autonomous Session-Based Gmail Agent"
          onClick={() => setActiveTab('home')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#sparkle-grad)" />
            <defs>
              <linearGradient id="sparkle-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4285F4" />
                <stop offset="0.5" stopColor="#9B51E0" />
                <stop offset="1" stopColor="#EA4335" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Icon Navigation Strip */}
        <div className="icon-nav-group">
          {/* Home / Busy Session Dashboard */}
          <button 
            className={`slim-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
            title="Glossy Dashboard & Session Controls"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </button>

          {/* Activity Log & Triage Feed */}
          <button 
            className={`slim-nav-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
            title="Live Email Triage Activity Log"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Commitment Tracker */}
          <button 
            className={`slim-nav-btn ${activeTab === 'commitments' ? 'active' : ''}`}
            onClick={() => setActiveTab('commitments')}
            title="Extracted Obligations & Commitments"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>

          {/* Email Simulator */}
          <button 
            className="slim-nav-btn"
            onClick={onOpenSimulator}
            title="Interactive Demo Email Injector"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom User Profile Avatar & Guardrail Status Pill */}
      <div className="slim-bottom">
        {/* Settings Gear Icon */}
        <button 
          className="slim-nav-btn"
          onClick={() => setShowSessionMenu(!showSessionMenu)}
          title="Session Guardrail Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {/* User Profile Avatar & Guardrail Active Indicator */}
        <div className="user-profile-group">
          <div className="user-circle-avatar" title="Ankit Pandit (Taskmaster User)">
            A
          </div>
          <button 
            className={`edu-status-pill ${activeSession ? 'active' : ''}`}
            onClick={() => setShowSessionMenu(!showSessionMenu)}
            title={activeSession ? 'Glossy Busy Guardrail Active' : 'Start Session'}
          >
            {activeSession ? `${formatTimeLeft(timeLeft)}` : 'Glossy'}
          </button>
        </div>

        {/* Session Control Popover Menu */}
        {showSessionMenu && (
          <div className="guardrail-menu-popover">
            <div className="popover-header">
              <strong>Glossy Busy Guardrail</strong>
            </div>
            {activeSession ? (
              <div className="popover-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span className="pulse-dot"></span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>SESSION ACTIVE</span>
                </div>
                <p className="popover-timer">Time Remaining: {formatTimeLeft(timeLeft)}</p>
                <p className="popover-sub" style={{ marginBottom: '10px' }}>
                  Glossy is triaging incoming emails & creating drafts for review.
                </p>
                <button className="popover-btn-end" onClick={() => { onEndSession(); setShowSessionMenu(false); }}>
                  End Session & Generate Briefing
                </button>
              </div>
            ) : (
              <div className="popover-content">
                <p className="popover-sub">Select busy session duration:</p>
                <div className="popover-preset-row">
                  <button onClick={() => { onStartSession(15); setShowSessionMenu(false); }}>15m</button>
                  <button onClick={() => { onStartSession(30); setShowSessionMenu(false); }}>30m</button>
                  <button onClick={() => { onStartSession(60); setShowSessionMenu(false); }}>60m</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
