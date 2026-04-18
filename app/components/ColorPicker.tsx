'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Color, hsvToRgb, rgbToHsv, colorToHex, colorToRgb } from '../lib/game-logic';

interface ColorPickerProps {
  color: Color;
  onChange: (color: Color) => void;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, disabled = false }) => {
  const [hsv, setHsv] = useState(rgbToHsv(color.r, color.g, color.b));
  const diskRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  useEffect(() => { setHsv(rgbToHsv(color.r, color.g, color.b)); }, [color.r, color.g, color.b]);

  const drawDisk = useCallback(() => {
    const canvas = diskRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { width: W, height: H } = canvas;
    const cx = W / 2, cy = H / 2, R = W / 2;
    const img = ctx.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= R) {
          const h = (Math.atan2(dy, dx) * 180 / Math.PI + 180) % 360;
          const { r, g, b } = hsvToRgb(h, dist / R, 1);
          const i = (y * W + x) * 4;
          d[i]=r; d[i+1]=g; d[i+2]=b; d[i+3]=255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  useEffect(() => { drawDisk(); }, [drawDisk]);

  const pick = (clientX: number, clientY: number) => {
    if (disabled || !diskRef.current) return;
    const rect = diskRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    const dx = clientX-cx, dy = clientY-cy;
    const s = Math.min(1, Math.sqrt(dx*dx+dy*dy) / (rect.width/2));
    const h = ((Math.atan2(dy,dx)*180/Math.PI)+180)%360;
    const next = { ...hsv, h, s };
    setHsv(next); onChange(hsvToRgb(next.h, next.s, next.v));
  };

  const setV = (v: number) => { if (disabled) return; const next={...hsv,v}; setHsv(next); onChange(hsvToRgb(next.h,next.s,next.v)); };

  const onMove = useCallback((e: MouseEvent) => { if (dragging.current) pick(e.clientX,e.clientY); }, [hsv,disabled]);
  const onUp   = useCallback(()=>{ dragging.current=false; }, []);
  useEffect(() => {
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [onMove, onUp]);

  const handleX = `calc(50% + ${Math.cos((hsv.h-180)*Math.PI/180)*hsv.s*50}%)`;
  const handleY = `calc(50% + ${Math.sin((hsv.h-180)*Math.PI/180)*hsv.s*50}%)`;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs fade-in">

      {/* ── Disk ── */}
      <div
        className="relative rounded-full cursor-crosshair select-none"
        style={{ width: 280, height: 280, boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)' }}
      >
        <canvas
          ref={diskRef}
          width={280} height={280}
          className="rounded-full block w-full h-full"
          onMouseDown={e => { dragging.current=true; pick(e.clientX,e.clientY); }}
          onTouchStart={e => { dragging.current=true; const t=e.touches[0]; pick(t.clientX,t.clientY); }}
          onTouchMove={e => { e.preventDefault(); const t=e.touches[0]; pick(t.clientX,t.clientY); }}
        />
        {/* Handle */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 20, height: 20,
            left: handleX, top: handleY,
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            border: '2.5px solid white',
            boxShadow: '0 0 0 1.5px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.3)',
            backgroundColor: colorToRgb(color),
            transition: 'background-color 0.05s',
          }}
        />
      </div>

      {/* ── Live Preview ── */}
      <div
        className="card w-full flex items-center gap-4 p-4"
        style={{ borderRadius: '1.25rem' }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: 12, flexShrink: 0,
            backgroundColor: colorToRgb(color),
            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
            transition: 'background-color 0.08s',
          }}
        />
        <div className="flex flex-col gap-0.5">
          <p className="font-mono font-bold text-xl tracking-tight" style={{ color: 'var(--fg)' }}>
            {colorToHex(color).toUpperCase()}
          </p>
          <p className="text-xs" style={{ color: 'var(--fg2)' }}>
            rgb({color.r}, {color.g}, {color.b})
          </p>
        </div>
      </div>

      {/* ── Brightness ── */}
      <div className="w-full space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold" style={{ color: 'var(--fg2)' }}>Brightness</span>
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--fg)' }}>{Math.round(hsv.v*100)}%</span>
        </div>
        <div className="relative">
          <input
            type="range" min="0" max="1" step="0.005" value={hsv.v}
            onChange={e => setV(parseFloat(e.target.value))}
            className="w-full relative z-10"
            disabled={disabled}
            style={{ background: `linear-gradient(to right, #000 0%, ${colorToRgb(hsvToRgb(hsv.h,hsv.s,1))} 100%)`, height: 6, borderRadius: 100 }}
          />
        </div>
      </div>
    </div>
  );
};
