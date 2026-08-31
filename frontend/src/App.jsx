import React, { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { CommandConsole } from './components/CommandConsole';
import { ActivityCenter } from './components/ActivityCenter';
import { CommitmentsTracker } from './components/CommitmentsTracker';
import { EmailSimulator } from './components/EmailSimulator';
import { SessionReportModal } from './components/SessionReportModal';
import { notifyImportantEmail, notifySessionEnded } from './services/browser_notifications';

export function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeSession, setActiveSession] = useState(null);
  const [activities, setActivities] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [sessionReport, setSessionReport] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Glossy Flash 3.5');

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

  const handleStartSession = async (durationMinutes) => {
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
        
        // Trigger Native Browser Notification for Important / Ambiguous emails
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

  return (
    <div className="app-viewport">
      <div className="app-glass-frame">
        {/* Slim Icon Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSession={activeSession}
          onStartSession={handleStartSession}
          onEndSession={handleEndSession}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />

        {/* Main Gemini Workspace Area with Glossy Context */}
        <main className="main-content-area">
          {/* Top Right Pencil Edit Button */}
          <button 
            className="top-right-edit-btn" 
            title="New Glossy Session"
            onClick={() => setActiveTab('home')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>

          {/* Center Gemini Hero Headline with Glossy Personalization */}
          <HeroSection />

          {/* Center Gemini Capsule Command Console */}
          <CommandConsole
            onSimulateClick={() => setIsSimulatorOpen(true)}
            onQuerySubmit={handleQuerySubmit}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
            activeSession={activeSession}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />

          {/* Dynamic Activity / Commitment Content Tabs */}
          {activeTab === 'activity' && (
            <div className="dashboard-content-tabs">
              <ActivityCenter activities={activities} />
            </div>
          )}

          {activeTab === 'commitments' && (
            <div className="dashboard-content-tabs">
              <CommitmentsTracker commitments={commitments} />
            </div>
          )}
        </main>
      </div>

      {/* Email Simulator Modal Dialog */}
      {isSimulatorOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F1F1F' }}>
                Interactive Email Simulator
              </h3>
              <button 
                onClick={() => setIsSimulatorOpen(false)}
                style={{ color: '#747775', fontSize: '18px', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
            <EmailSimulator onSimulate={handleSimulateEmail} />
          </div>
        </div>
      )}

      {/* Session Executive Briefing Report Modal */}
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
