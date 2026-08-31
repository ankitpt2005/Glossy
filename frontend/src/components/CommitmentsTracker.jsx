import React from 'react';
import { CheckSquare, Calendar, User } from 'lucide-react';

export const CommitmentsTracker = ({ commitments }) => {
  if (!commitments || commitments.length === 0) {
    return (
      <div className="card-section">
        <div className="section-header">
          <h2 className="section-title">
            <CheckSquare size={18} color="#DDEBE5" />
            Extracted Commitments
          </h2>
        </div>
        <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--color-cool-slate)', fontSize: '12px' }}>
          No commitments extracted yet. Gemini continuously extracts tasks, promises, and deadlines from incoming threads.
        </div>
      </div>
    );
  }

  return (
    <div className="card-section">
      <div className="section-header">
        <h2 className="section-title">
          <CheckSquare size={18} color="#DDEBE5" />
          Extracted Commitments
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--color-sage-mint)', fontWeight: 600 }}>
          {commitments.length} Logged
        </span>
      </div>

      <div>
        {commitments.map((c, i) => (
          <div key={c.commitment_id || i} className="commitment-card">
            <div className="commitment-title">{c.task}</div>
            <div className="commitment-meta">
              <span>
                <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {c.owner} ➔ {c.to}
              </span>
              <span>
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px', color: '#DDEBE5' }} />
                {c.deadline || 'Unspecified'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
