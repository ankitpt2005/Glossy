import React, { useState } from 'react';
import { Send, Zap, Sparkles } from 'lucide-react';

export const EmailSimulator = ({ onSimulate }) => {
  const [sender, setSender] = useState('alex.client@enterprise.com');
  const [subject, setSubject] = useState('Urgent: Q3 Deliverable Approval Needed');
  const [body, setBody] = useState('Hi, checking on the quarterly budget sign-off and project deliverable status. Can you confirm by 5 PM today?');
  const [loading, setLoading] = useState(false);

  const presets = [
    {
      label: '⚡ Urgent Client Inquiry',
      sender: 'alex.client@enterprise.com',
      subject: 'Urgent: Q3 Deliverable Approval Needed',
      body: 'Hi, checking on the quarterly budget sign-off and project deliverable status. Can you confirm by 5 PM today?'
    },
    {
      label: '☕ Casual Lunch Invite',
      sender: 'sarah.colleague@techcorp.org',
      subject: 'Lunch today at 1 PM?',
      body: 'Hey! Grab lunch at the bistro near office at 1 PM today?'
    },
    {
      label: '⚖️ Ambiguous Contract Note',
      sender: 'legal@vendor.net',
      subject: 'Clause 4.2 Indemnity Revision',
      body: 'Regarding the indemnification amendment discussed last week, please review section 4.2 and let us know your stance on liabilities.'
    },
    {
      label: '📰 Weekly Digest Promo',
      sender: 'no-reply@techdigest.io',
      subject: 'Your Weekly Cloud Tech Digest',
      body: 'Here are the top 10 stories in Cloud Architecture and AI models this week!'
    }
  ];

  const applyPreset = (p) => {
    setSender(p.sender);
    setSubject(p.subject);
    setBody(p.body);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !body) return;

    setLoading(true);
    await onSimulate({ sender, subject, body });
    setLoading(false);
  };

  return (
    <div className="card-section">
      <div className="section-header">
        <h2 className="section-title">
          <Zap size={18} color="#DDEBE5" />
          Interactive Demo Email Injector
        </h2>
        <span style={{ fontSize: '11px', color: 'var(--color-sage-mint)', fontWeight: 600 }}>
          <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Gemini 3.5 ADK Live Simulator
        </span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--color-cool-slate)', marginBottom: '14px' }}>
        Inject a test email into Glossy's event pipeline to observe live Gemini triage, safety guardrail enforcement, commitment extraction, and desktop notification triggers.
      </p>

      {/* Preset Scenarios */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="btn-preset"
            style={{ fontSize: '11px', padding: '6px 12px' }}
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="sim-form">
        <div>
          <label style={{ fontSize: '11px', color: 'var(--color-cool-slate)', display: 'block', marginBottom: '4px' }}>Sender Email</label>
          <input
            type="email"
            className="sim-input"
            style={{ width: '100%' }}
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--color-cool-slate)', display: 'block', marginBottom: '4px' }}>Email Subject</label>
          <input
            type="text"
            className="sim-input"
            style={{ width: '100%' }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--color-cool-slate)', display: 'block', marginBottom: '4px' }}>Email Body</label>
          <textarea
            className="sim-textarea"
            style={{ width: '100%', height: '80px' }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-sim-send" disabled={loading}>
          {loading ? 'Triaging with Gemini...' : 'Dispatch Email to Autonomous Agent'}
        </button>
      </form>
    </div>
  );
};
