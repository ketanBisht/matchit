'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Color, hsvToRgb, rgbToHsv, colorToHex, colorToRgb } from '../lib/game-logic';

interface ColorPickerProps {
  color: Color;
  onChange: (color: Color) => void;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  color, 
  onChange, 
  disabled = false 
}) => {
  const [hsv, setHsv] = useState(rgbToHsv(color.r, color.g, color.b));
  const diskCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingDisk = useRef(false);

  // Sync internal HSV state when external color changes (new round)
  useEffect(() => {
    const newHsv = rgbToHsv(color.r, color.g, color.b);
    setHsv(newHsv);
  }, [color.r, color.g, color.b]);

  const drawDisk = useCallback(() => {
    const canvas = diskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          const angle = Math.atan2(dy, dx) * 180 / Math.PI + 180;
          const s = dist / radius;
          const { r, g, b } = hsvToRgb(angle, s, 1);
          const index = (y * width + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  useEffect(() => {
    drawDisk();
  }, [drawDisk]);

  const updateDisk = (clientX: number, clientY: number) => {
    if (disabled || !diskCanvasRef.current) return;
    const rect = diskCanvasRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const radius = rect.width / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const s = Math.min(1, dist / radius);
    let h = (Math.atan2(dy, dx) * 180 / Math.PI + 180) % 360;
    if (h < 0) h += 360;

    const newHsv = { ...hsv, h, s };
    setHsv(newHsv);
    onChange(hsvToRgb(newHsv.h, newHsv.s, newHsv.v));
  };

  const handleValueChange = (v: number) => {
    if (disabled) return;
    const newHsv = { ...hsv, v };
    setHsv(newHsv);
    onChange(hsvToRgb(newHsv.h, newHsv.s, newHsv.v));
  };

  const handleMouseDownDisk = (e: React.MouseEvent) => {
    isDraggingDisk.current = true;
    updateDisk(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingDisk.current) {
      updateDisk(e.clientX, e.clientY);
    }
  }, [hsv, disabled]);

  const handleMouseUp = useCallback(() => {
    isDraggingDisk.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const hex = colorToHex(color);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm animate-fade-in">
      {/* HS Disk */}
      <div className="relative p-2 bg-white/5 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.4)] border border-white/10">
        <div className="relative w-64 h-64 md:w-80 md:h-80 cursor-crosshair rounded-full overflow-hidden">
          <canvas
            ref={diskCanvasRef}
            width={320}
            height={320}
            className="w-full h-full"
            onMouseDown={handleMouseDownDisk}
          />
          {/* Selector handle */}
          <div 
            className="absolute w-6 h-6 border-[3px] border-white rounded-full shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `calc(50% + ${Math.cos((hsv.h - 180) * Math.PI / 180) * hsv.s * 50}%)`,
              top: `calc(50% + ${Math.sin((hsv.h - 180) * Math.PI / 180) * hsv.s * 50}%)`,
              backgroundColor: colorToRgb(color)
            }}
          />
        </div>
      </div>

      {/* Diff Box / Preview Row */}
      <div className="w-full bg-black/40 p-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 text-center italic">Your Creation</p>
        <div className="flex items-center gap-6">
          <div 
            className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] shrink-0 transition-colors duration-200"
            style={{ backgroundColor: colorToRgb(color) }}
          />
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/10 text-center">
              <span className="font-mono text-2xl font-black text-white tracking-tight">{hex}</span>
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Real-time Hex</p>
          </div>
        </div>
      </div>

      {/* Brightness (Value) Slider */}
      <div className="w-full space-y-3 px-1">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Brightness</label>
          <span className="font-mono text-xs text-slate-400">{Math.round(hsv.v * 100)}%</span>
        </div>
        <div className="relative h-4 group">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={hsv.v}
            onChange={(e) => handleValueChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={disabled}
          />
          {/* Slider Track */}
          <div 
            className="w-full h-full rounded-full border border-white/10 shadow-inner"
            style={{ 
              background: `linear-gradient(to right, #000, ${colorToRgb(hsvToRgb(hsv.h, hsv.s, 1))})` 
            }}
          />
          {/* Slider Handle */}
          <div 
            className="absolute top-1/2 w-8 h-8 bg-white rounded-full shadow-2xl border-4 border-slate-900 transform -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform group-hover:scale-110"
            style={{ left: `${hsv.v * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
