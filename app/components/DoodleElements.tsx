import React from 'react';

// Starburst / asterisk - key motif from the inspiration
export const Starburst = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <polygon points="50,0 53,47 100,50 53,53 50,100 47,53 0,50 47,47" />
  </svg>
);

// Pencil + Paintbrush crossed - like in the reference
export const PencilBrush = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Pencil */}
    <line x1="20" y1="100" x2="80" y2="20" />
    <polygon points="80,20 90,10 95,30" fill="currentColor" />
    <line x1="20" y1="100" x2="15" y2="110" />
    {/* Brush */}
    <line x1="100" y1="100" x2="40" y2="20" />
    <ellipse cx="38" cy="18" rx="6" ry="12" transform="rotate(-45 38 18)" fill="currentColor" />
  </svg>
);

// Newspaper tag "SHOW TIME"
export const ShowTime = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 80" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="5" y="5" width="110" height="70" rx="8" />
    <rect x="15" y="15" width="90" height="20" rx="3" />
    <text x="60" y="31" textAnchor="middle" fontFamily="serif" fontSize="14" fontWeight="900" fill="currentColor" stroke="none">SHOW TIME</text>
    <line x1="15" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="2" />
    <line x1="15" y1="60" x2="55" y2="60" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Camera
export const Camera = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <rect x="10" y="25" width="100" height="65" rx="10" />
    <circle cx="60" cy="57" r="20" />
    <circle cx="60" cy="57" r="12" />
    <rect x="38" y="15" width="44" height="15" rx="5" />
    <circle cx="92" cy="38" r="5" />
  </svg>
);

// Large starburst spark (for the big one in the center)
export const BigSpark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 0 L53 44 L75 25 L56 47 L100 50 L56 53 L75 75 L53 56 L50 100 L47 56 L25 75 L44 53 L0 50 L44 47 L25 25 L47 44 Z" />
  </svg>
);
