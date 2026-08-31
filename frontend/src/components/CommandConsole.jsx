import React, { useState } from 'react';

export function CommandConsole({ 
  onSimulateClick, 
  onQuerySubmit,
  onStartSession,
  onEndSession,
  activeSession,
  selectedModel,
  setSelectedModel 
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onQuerySubmit(inputText);
    setInputText('');
  };

  return (
    <div className="gemini-capsule-wrapper">
      <form onSubmit={handleSubmit} className="gemini-capsule-bar">
        {/* Left Side Attachment & Guardrail Shield */}
        <div className="capsule-left">
          <button 
            type="button" 
            className="capsule-plus-btn"
            onClick={onSimulateClick}
            title="Inject Test Email into Live Triage Simulator"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <div 
            className="capsule-shield-icon" 
            title="Glossy Safety Guardrail: Important emails are flagged & drafted for review"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
        </div>

        {/* Center Input Field */}
        <input
          type="text"
          className="capsule-input"
          placeholder="Ask Glossy to triage emails, set guardrails, or check commitments..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Right Side Model Selector & Audio / Send Button */}
        <div className="capsule-right">
          <div className="capsule-model-dropdown" title="Select Gemini Model Brain">
            <span>{selectedModel || 'Glossy Flash 3.5'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </div>

          <button type="submit" className="capsule-mic-btn" title="Send Command to Glossy AI">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path>
            </svg>
          </button>
        </div>
      </form>

      {/* Glossy Quick Action Pills below Capsule */}
      <div className="capsule-quick-pills">
        {!activeSession ? (
          <button 
            type="button" 
            className="quick-pill-btn highlight"
            onClick={() => onStartSession(30)}
          >
            <span className="pill-emoji">🛡️</span>
            <span>Start 30m Guardrail</span>
          </button>
        ) : (
          <button 
            type="button" 
            className="quick-pill-btn active-session"
            onClick={onEndSession}
          >
            <span className="pill-emoji">⏹️</span>
            <span>End Session & Briefing</span>
          </button>
        )}

        <button 
          type="button" 
          className="quick-pill-btn"
          onClick={onSimulateClick}
        >
          <span className="pill-emoji">✉️</span>
          <span>Simulate Email</span>
        </button>

        <button 
          type="button" 
          className="quick-pill-btn"
          onClick={() => onQuerySubmit('Extract commitments')}
        >
          <span className="pill-emoji">📌</span>
          <span>Commitments</span>
        </button>

        <button 
          type="button" 
          className="quick-pill-btn"
          onClick={() => onQuerySubmit('Show activity log')}
        >
          <span className="pill-emoji">🔍</span>
          <span>Live Triage Feed</span>
        </button>
      </div>
    </div>
  );
}

export default CommandConsole;
