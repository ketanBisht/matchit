'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Color, hsvToRgb, rgbToHsv, colorToRgb } from '../lib/game-logic';

interface ColorPickerProps {
  color: Color;
  onChange: (color: Color) => void;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, disabled = false }) => {
  const [hsv, setHsv] = useState(rgbToHsv(color.r, color.g, color.b));
  const svCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingSV = useRef(false);

  // Sync internal HSV state when external color changes (e.g. at round start)
  useEffect(() => {
    const newHsv = rgbToHsv(color.r, color.g, color.b);
    setHsv(newHsv);
  }, [color.r, color.g, color.b]);

  const drawSVCanvas = useCallback(() => {
    const canvas = svCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill with current Hue
    ctx.fillStyle = `hsl(${hsv.h}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // White gradient (horizontal for saturation)
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, 'white');
    whiteGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // Black gradient (vertical for value)
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'transparent');
    blackGrad.addColorStop(1, 'black');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
  }, [hsv.h]);

  useEffect(() => {
    drawSVCanvas();
  }, [drawSVCanvas]);

  const updateSV = (clientX: number, clientY: number) => {
    if (disabled || !svCanvasRef.current) return;
    const rect = svCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    const newHsv = { ...hsv, s: x, v: 1 - y };
    setHsv(newHsv);
    onChange(hsvToRgb(newHsv.h, newHsv.s, newHsv.v));
  };

  const handleMouseDownSV = (e: React.MouseEvent) => {
    isDraggingSV.current = true;
    updateSV(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingSV.current) {
      updateSV(e.clientX, e.clientY);
    }
  }, [hsv, disabled]);

  const handleMouseUp = useCallback(() => {
    isDraggingSV.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleHueChange = (h: number) => {
    if (disabled) return;
    const newHsv = { ...hsv, h };
    setHsv(newHsv);
    onChange(hsvToRgb(newHsv.h, newHsv.s, newHsv.v));
  };

  return (
    <div className="flex flex-col items-center gap-8 animate-slide-up w-full max-w-sm">
      <div className="relative group p-4 glass rounded-[2rem]">
        {/* SV Square */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-xl cursor-crosshair">
          <canvas
            ref={svCanvasRef}
            width={320}
            height={320}
            className="w-full h-full"
            onMouseDown={handleMouseDownSV}
          />
          {/* SV Selector Handle */}
          <div 
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${hsv.s * 100}%`, 
              top: `${(1 - hsv.v) * 100}%`,
              backgroundColor: colorToRgb(color)
            }}
          />
        </div>
      </div>

      {/* Hue Slider */}
      <div className="w-full px-4 space-y-3">
        <label className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center block">Hue</label>
        <div className="relative h-6 group">
          <input
            type="range"
            min="0"
            max="359"
            value={hsv.h}
            onChange={(e) => handleHueChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={disabled}
          />
          <div 
            className="w-full h-full rounded-full shadow-inner"
            style={{ 
              background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' 
            }}
          />
          {/* Hue Handle */}
          <div 
            className="absolute top-1/2 w-8 h-8 bg-white border-4 border-slate-900 rounded-full shadow-lg transform -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform group-hover:scale-110"
            style={{ 
              left: `${(hsv.h / 360) * 100}%`,
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};
