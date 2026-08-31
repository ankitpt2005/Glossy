import React from 'react';
import { Award, CheckCircle, Mail, AlertCircle, RefreshCw, X } from 'lucide-react';

export const SessionReportModal = ({ report, onClose }) => {
  if (!report) return null;

  const { metrics, mail_summary, commitments, followups } = report;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="modal-title">
              <Award size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'sub' }} />
              Executive Session Briefing
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-cool-slate)', marginTop: '4px' }}>
              Glossy completed your busy session. Here is your consolidated summary report.
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-cool-slate)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="report-stat-grid">
          <div className="report-stat-card">
            <div className="stat-num" style={{ color: 'var(--color-off-white)' }}>
              {metrics?.total_triaged || 0}
            </div>
            <div className="stat-lbl">Emails Triaged</div>
          </div>
          <div className="report-stat-card">
            <div className="stat-num" style={{ color: 'var(--color-sage-mint)' }}>
              {metrics?.auto_sent || 0}
            </div>
            <div className="stat-lbl">Safe Auto-Sent</div>
          </div>
          <div className="report-stat-card">
            <div className="stat-num" style={{ color: '#ffd166' }}>
              {metrics?.drafted_for_review || 0}
            </div>
            <div className="stat-lbl">Drafts Pending Review</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-off-white)', marginBottom: '10px' }}>
            Extracted Commitments ({commitments?.length || 0})
          </h3>
          {commitments && commitments.length > 0 ? (
            commitments.map((c, idx) => (
              <div key={idx} style={{ background: 'var(--bg-obsidian)', padding: '10px 14px', borderRadius: '6px', marginBottom: '8px', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-off-white)' }}>{c.task}</div>
                <div style={{ color: 'var(--color-cool-slate)', fontSize: '11px', marginTop: '2px' }}>
                  Owner: {c.owner} ➔ {c.to} | Deadline: {c.deadline || 'Unspecified'}
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--color-cool-slate)', fontStyle: 'italic' }}>No new commitments extracted during this session.</p>
          )}
        </div>

        {/* Unanswered Follow-ups */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-off-white)', marginBottom: '10px' }}>
            Generated Outbound Follow-ups ({followups?.length || 0})
          </h3>
          {followups && followups.length > 0 ? (
            followups.map((f, idx) => (
              <div key={idx} style={{ background: 'rgba(43, 63, 85, 0.4)', borderLeft: '3px solid var(--color-sage-mint)', padding: '10px 14px', borderRadius: '4px', marginBottom: '8px', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-off-white)' }}>To: {f.recipient} — "{f.subject}"</div>
                <div style={{ color: 'var(--color-cool-slate)', fontSize: '11px', marginTop: '2px' }}>
                  Pending for {f.days_pending} days. Draft follow-up created in Gmail Drafts.
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--color-cool-slate)', fontStyle: 'italic' }}>No unanswered outbound follow-ups detected.</p>
          )}
        </div>

        <button className="btn-action-main" onClick={onClose}>
          Acknowledge & Dismiss Briefing
        </button>
      </div>
    </div>
  );
};
