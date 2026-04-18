import React from 'react';
import { Color } from '../lib/game-logic';

interface ColorSlidersProps {
  color: Color;
  onChange: (color: Color) => void;
  disabled?: boolean;
}

export const ColorSliders: React.FC<ColorSlidersProps> = ({ color, onChange, disabled = false }) => {
  const handleChange = (key: keyof Color, value: number) => {
    onChange({ ...color, [key]: value });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md animate-slide-up">
      <Slider 
        label="Red" 
        value={color.r} 
        onChange={(v) => handleChange('r', v)} 
        colorClass="bg-red-500" 
        disabled={disabled}
      />
      <Slider 
        label="Green" 
        value={color.g} 
        onChange={(v) => handleChange('g', v)} 
        colorClass="bg-green-500" 
        disabled={disabled}
      />
      <Slider 
        label="Blue" 
        value={color.b} 
        onChange={(v) => handleChange('b', v)} 
        colorClass="bg-blue-500" 
        disabled={disabled}
      />
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  colorClass: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, colorClass, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-sm font-semibold text-slate-300 uppercase tracking-tighter">{label}</label>
        <span className="font-mono text-sm text-white bg-white/10 px-2 py-0.5 rounded">{value}</span>
      </div>
      <div className="relative flex items-center h-8">
        <div className="absolute inset-0 bg-white/5 rounded-full pointer-events-none" />
        <input
          type="range"
          min="0"
          max="255"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className={`relative z-10 w-full cursor-pointer accent-blue-500`}
        />
      </div>
    </div>
  );
};
