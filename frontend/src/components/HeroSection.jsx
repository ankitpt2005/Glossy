import React from 'react';

export function HeroSection() {
  return (
    <div className="hero-section">
      <div className="hero-logo-container" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/glossy-logo.png" 
          alt="Project Glossy Logo" 
          style={{ height: '72px', objectFit: 'contain' }}
        />
      </div>
      <h1 className="hero-title">
        Triage with Glossy, <span className="hero-highlight">Ankit</span>.
      </h1>
    </div>
  );
}

export default HeroSection;
