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
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onQuerySubmit(query);
    setQuery('');
  };

  return (
    <div className="console-wrapper">
      <form onSubmit={handleSubmit} className="console-input-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Triaging your emails..."
          className="console-input-field"
        />

        <div className="console-controls-right">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-selector-flat"
          >
            <option value="Glossy Flash 3.5">Glossy Flash 3.5 ∨</option>
            <option value="Glossy Pro 3.5">Glossy Pro 3.5 ∨</option>
          </select>
        </div>
      </form>
    </div>
  );
}

export default CommandConsole;
