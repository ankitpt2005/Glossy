import React from 'react';
import { Mail, AlertTriangle, Send, FileText, CheckCircle2 } from 'lucide-react';

export const ActivityCenter = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="card-section">
        <div className="section-header">
          <h2 className="section-title">
            <Mail size={18} color="#DDEBE5" />
            Live Activity Feed
          </h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-cool-slate)', fontSize: '13px' }}>
          No email triage activity recorded yet. Start a busy session or use the email simulator below to test live event processing.
        </div>
      </div>
    );
  }

  const renderBadge = (action, classification) => {
    if (action === 'auto_sent') {
      return <span className="badge-tag badge-auto-sent"><Send size={10} style={{ marginRight: '4px' }} /> SAFE AUTO-SENT</span>;
    }
    if (action === 'flagged_for_review' || classification === 'important') {
      return <span className="badge-tag badge-important"><AlertTriangle size={10} style={{ marginRight: '4px' }} /> FLAGGED FOR REVIEW</span>;
    }
    return <span className="badge-tag badge-flagged"><FileText size={10} style={{ marginRight: '4px' }} /> DRAFT CREATED</span>;
  };

  return (
    <div className="card-section">
      <div className="section-header">
        <h2 className="section-title">
          <Mail size={18} color="#DDEBE5" />
          Live Activity Feed
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--color-cool-slate)' }}>
          {activities.length} items logged
        </span>
      </div>

      <div className="activity-list">
        {activities.map((item, index) => (
          <div key={item.action_id || index} className="activity-item">
            <div className="activity-top">
              <span className="activity-sender">{item.sender}</span>
              {renderBadge(item.action, item.classification)}
            </div>

            <div className="activity-subject">{item.subject}</div>

            <div className="activity-reasoning">
              <strong>Gemini Triage Judgment:</strong> {item.reasoning}
            </div>

            {item.suggested_reply && (
              <div className="draft-preview-box">
                <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--color-cool-slate)', marginBottom: '4px' }}>
                  {item.action === 'auto_sent' ? 'Auto-Sent Reply:' : 'Drafted Response for Review:'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                  "{item.suggested_reply}"
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
