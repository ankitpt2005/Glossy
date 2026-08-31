import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, ShieldCheck } from 'lucide-react';

export const SessionHeader = ({ activeSession, onStartSession, onEndSession }) => {
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!activeSession) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const expectedEnd = activeSession.expected_end_time || (activeSession.start_time + (activeSession.duration_minutes * 60));
      const now = Date.now() / 1000;
      const remaining = Math.max(0, Math.floor(expectedEnd - now));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="session-control-box">
      <div className="session-status-bar">
        <div>
          <span className={`status-badge ${activeSession ? 'active' : 'idle'}`}>
            <span className="pulse-dot"></span>
            {activeSession ? 'AUTONOMOUS SESSION ACTIVE' : 'AGENT SLEEPING (IDLE)'}
          </span>
        </div>
        {activeSession && (
          <div className="timer-display">
            <Clock size={20} style={{ display: 'inline', marginRight: '8px', color: '#DDEBE5' }} />
            {formatTimer(timeLeft)}
          </div>
        )}
      </div>

      {!activeSession ? (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--color-cool-slate)', marginBottom: '12px' }}>
            Declare your busy session duration. Glossy will autonomously triage incoming emails, draft/auto-send low-stakes replies, and flag important requests for your return.
          </p>
          <div className="duration-presets">
            {[30, 60, 120].map((mins) => (
              <button
                key={mins}
                className={`btn-preset ${selectedDuration === mins ? 'selected' : ''}`}
                onClick={() => setSelectedDuration(mins)}
              >
                {mins === 60 ? '1 Hour' : mins === 120 ? '2 Hours' : `${mins} Mins`}
              </button>
            ))}
          </div>
          <button
            className="btn-action-main"
            onClick={() => onStartSession(selectedDuration)}
          >
            <Play size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Start Busy Session ({selectedDuration} Mins)
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--color-cool-slate)', marginBottom: '12px' }}>
            <div>
              <span style={{ color: 'var(--color-sage-mint)', fontWeight: 700 }}>
                {activeSession.stats?.total_triaged || 0}
              </span> Triaged
            </div>
            <div>
              <span style={{ color: 'var(--color-sage-mint)', fontWeight: 700 }}>
                {activeSession.stats?.auto_sent || 0}
              </span> Auto-Sent
            </div>
            <div>
              <span style={{ color: '#ffd166', fontWeight: 700 }}>
                {activeSession.stats?.flagged || activeSession.stats?.drafted || 0}
              </span> Flagged for Review
            </div>
            <div>
              <span style={{ color: 'var(--color-sage-mint)', fontWeight: 700 }}>
                {activeSession.stats?.commitments_logged || 0}
              </span> Commitments
            </div>
          </div>
          <button className="btn-action-end" onClick={onEndSession}>
            <Square size={16} style={{ display: 'inline', marginRight: '6px' }} />
            End Session & Generate Briefing
          </button>
        </div>
      )}
    </div>
  );
};
