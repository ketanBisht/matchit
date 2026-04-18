import React from 'react';
import { Color, colorToRgb, colorToHex } from '../lib/game-logic';

interface ColorDisplayProps {
  color: Color;
  label: string;
  showDetails?: boolean;
}

export const ColorDisplay: React.FC<ColorDisplayProps> = ({ color, label, showDetails = false }) => (
  <div className="flex flex-col items-center gap-3">
    <div
      className="w-36 h-36 md:w-44 md:h-44 rounded-2xl"
      style={{
        backgroundColor: colorToRgb(color),
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
      }}
    />
    <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>{label}</p>
    {showDetails && (
      <p className="font-mono text-sm font-bold" style={{ color: 'var(--fg)' }}>{colorToHex(color).toUpperCase()}</p>
    )}
  </div>
);
