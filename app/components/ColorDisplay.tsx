import React from 'react';
import { Color, colorToRgb, colorToHex } from '../lib/game-logic';

interface ColorDisplayProps {
  color: Color;
  label: string;
  showDetails?: boolean;
}

export const ColorDisplay: React.FC<ColorDisplayProps> = ({ color, label, showDetails = false }) => {
  const rgb = colorToRgb(color);
  
  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <div 
        className="w-32 h-32 md:w-48 md:h-48 rounded-2xl shadow-2xl glass transition-colors duration-500 overflow-hidden"
        style={{ backgroundColor: rgb }}
      >
        <div className="w-full h-full bg-linear-to-br from-white/10 to-transparent" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{label}</p>
        {showDetails && (
          <p className="font-mono text-lg text-white mt-1">{colorToHex(color)}</p>
        )}
      </div>
    </div>
  );
};
