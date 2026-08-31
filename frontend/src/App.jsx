import React, { useState, useEffect } from 'react';
import './App.css';
import { HeroSection } from './components/HeroSection';
import { CommandConsole } from './components/CommandConsole';
import { ActivityCenter } from './components/ActivityCenter';
import { CommitmentsTracker } from './components/CommitmentsTracker';
import { EmailSimulator } from './components/EmailSimulator';
import { SessionReportModal } from './components/SessionReportModal';
import { AccountModal } from './components/AccountModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { notifyImportantEmail, notifySessionEnded } from './services/browser_notifications';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeSession, setActiveSession] = useState(null);
  const [activities, setActivities] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [sessionReport, setSessionReport] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Glossy Flash 3.5');
  const [currentTime, setCurrentTime] = useState('');

  // Live time ticker for bottom-left display (e.g. 10:05 AM)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial live data
  const fetchData = async () => {
    try {
      const [sessRes, actRes, commRes] = await Promise.all([
        fetch('/api/session/current').then(r => r.json()),
        fetch('/api/activity').then(r => r.json()),
        fetch('/api/commitments').then(r => r.json())
      ]);

      if (sessRes && sessRes.active_session) {
        setActiveSession(sessRes.active_session);
      } else {
        setActiveSession(null);
      }

      if (actRes && actRes.activity) {
        setActivities(actRes.activity);
      }

      if (commRes && commRes.commitments) {
        setCommitments(commRes.commitments);
      }
    } catch (err) {
      console.error("[Dashboard Fetch Error]:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSession = async (durationMinutes = 60) => {
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_minutes: durationMinutes })
      }).then(r => r.json());

      if (res && res.session) {
        setActiveSession(res.session);
        fetchData();
      }
    } catch (err) {
      console.error("[Start Session Error]:", err);
    }
  };

  const handleEndSession = async () => {
    try {
      const res = await fetch('/api/session/end', { method: 'POST' }).then(r => r.json());
      if (res && res.report) {
        setSessionReport(res.report);
        setActiveSession(null);
        fetchData();

        // Trigger Browser Notification for Session Completion
        notifySessionEnded(res.report.metrics || {});
      }
    } catch (err) {
      console.error("[End Session Error]:", err);
    }
  };

  const handleSimulateEmail = async (emailData) => {
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      }).then(r => r.json());

      if (res && res.action) {
        const action = res.action;
        
        if (action.needs_browser_notification) {
          notifyImportantEmail(action.sender, action.subject, action.reasoning);
        }

        fetchData();
        setIsSimulatorOpen(false);
        setActiveTab('activity');
      }
    } catch (err) {
      console.error("[Simulate Email Error]:", err);
    }
  };

  const handleQuerySubmit = (queryText) => {
    if (queryText.toLowerCase().includes('simulate') || queryText.toLowerCase().includes('test')) {
      setIsSimulatorOpen(true);
    } else if (queryText.toLowerCase().includes('commitment') || queryText.toLowerCase().includes('deadline')) {
      setActiveTab('commitments');
    } else {
      setActiveTab('activity');
    }
  };

  // Reset / New Chat Action
  const handleNewChat = () => {
    setActiveTab('home');
    setIsHistoryOpen(false);
    setIsSimulatorOpen(false);
  };

  // Delete Section / Clear All Activity History Action
  const handleClearAllHistory = () => {
    setActivities([]);
    setCommitments([]);
    setActiveTab('home');
  };

  // Delete Single Activity Entry
  const handleDeleteActivity = (id) => {
    setActivities(prev => prev.filter((act, idx) => (act.id !== id && idx !== id)));
  };

  return (
    <div className="minimal-viewport">
      {/* Top Left New Chat Action */}
      <button 
        className="top-left-new-chat-btn"
        title="New Chat / Reset Session"
        onClick={handleNewChat}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
      </button>

      {/* Top Right Avatar Circle */}
      <button 
        className="top-right-avatar-btn" 
        title="Account Profile"
        onClick={() => setIsAccountOpen(true)}
      >
        A
      </button>

      {/* Center Main Content Area */}
      <main className="center-workspace">
        <HeroSection />

        <CommandConsole
          onSimulateClick={() => setIsSimulatorOpen(true)}
          onQuerySubmit={handleQuerySubmit}
          onStartSession={handleStartSession}
          onEndSession={handleEndSession}
          activeSession={activeSession}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

        {/* Optional Active Workspace Tab Panels */}
        {activeTab === 'activity' && (
          <div className="center-tab-overlay">
            <div className="tab-header-row">
              <h3>Live Activity Feed</h3>
              <button onClick={() => setActiveTab('home')} className="icon-close-btn">✕</button>
            </div>
            <ActivityCenter activities={activities} />
          </div>
        )}

        {activeTab === 'commitments' && (
          <div className="center-tab-overlay">
            <div className="tab-header-row">
              <h3>Extracted Commitments</h3>
              <button onClick={() => setActiveTab('home')} className="icon-close-btn">✕</button>
            </div>
            <CommitmentsTracker commitments={commitments} />
          </div>
        )}
      </main>

      {/* Bottom Minimalist Navigation Bar */}
      <footer className="bottom-minimal-bar">
        {/* Bottom Left Live Clock */}
        <div className="bottom-clock-display">
          {currentTime || '10:05 AM'}
        </div>

        {/* Bottom Center Icon Strip */}
        <div className="bottom-icon-strip">
          <button 
            className="bottom-icon-btn" 
            title="Previous Chats & History"
            onClick={() => setIsHistoryOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>

          <button 
            className="bottom-icon-btn" 
            title="Email Simulator"
            onClick={() => setIsSimulatorOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </button>

          <button 
            className="bottom-icon-btn" 
            title="Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        {/* Bottom Right Active Guardrail Toggle */}
        <div className="bottom-right-action">
          {activeSession ? (
            <button className="btn-end-session-red" onClick={handleEndSession}>
              End Session
            </button>
          ) : (
            <button className="btn-start-session-navy" onClick={() => handleStartSession(60)}>
              Start Guardrail
            </button>
          )}
        </div>

        {/* Bottom Right Soft Sparkle Star Watermark */}
        <div className="bottom-sparkle-star">
          ✦
        </div>
      </footer>

      {/* Account Profile Modal */}
      {isAccountOpen && (
        <AccountModal onClose={() => setIsAccountOpen(false)} />
      )}

      {/* System Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          onClearHistory={handleClearAllHistory}
        />
      )}

      {/* Previous Chats & Activity History Drawer */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        activities={activities}
        onDeleteActivity={handleDeleteActivity}
      />

      {/* Email Simulator Modal */}
      {isSimulatorOpen && (
        <div className="modal-overlay" onClick={() => setIsSimulatorOpen(false)}>
          <div className="modal-content glossy-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F1F1F', margin: 0 }}>
                ✉️ Interactive Email Simulator
              </h3>
              <button onClick={() => setIsSimulatorOpen(false)} className="icon-close-btn">✕</button>
            </div>
            <EmailSimulator onSimulate={handleSimulateEmail} />
          </div>
        </div>
      )}

      {/* Executive Session Briefing Report Modal */}
      {sessionReport && (
        <SessionReportModal
          report={sessionReport}
          onClose={() => setSessionReport(null)}
        />
      )}
    </div>
  );
}

export default App;
