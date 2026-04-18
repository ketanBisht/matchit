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
      className="w-48 h-48 md:w-64 md:h-64 rounded-3xl"
      style={{
        backgroundColor: colorToRgb(color),
        boxShadow: '0 12px 48px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
      }}
    />
    <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--fg2)' }}>{label}</p>
    {showDetails && (
      <p className="font-mono text-sm font-bold" style={{ color: 'var(--fg)' }}>{colorToHex(color).toUpperCase()}</p>
    )}
  </div>
);
