export interface Color {
  r: number;
  g: number;
  b: number;
}

export const getRandomColor = (): Color => ({
  r: Math.floor(Math.random() * 256),
  g: Math.floor(Math.random() * 256),
  b: Math.floor(Math.random() * 256),
});

const colorDistance = (a: Color, b: Color): number => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const MAX_DISTANCE = Math.sqrt(255 * 255 * 3);

export const calculateScore = (target: Color, match: Color): number => {
  const linear = 1 - colorDistance(target, match) / MAX_DISTANCE;
  return Math.round(linear * 100);
};

export const getMatchPercentage = (target: Color, match: Color): number => {
  const linear = 1 - colorDistance(target, match) / MAX_DISTANCE;
  return Math.round(linear * 100);
};

export const colorToRgb = (color: Color): string => 
  `rgb(${color.r}, ${color.g}, ${color.b})`;

export const colorToHex = (color: Color): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
};

export interface HSV {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
}

export const hsvToRgb = (h: number, s: number, v: number): Color => {
  // Normalize hue to be within [0, 360)
  h = (h % 360 + 360) % 360;
  
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h >= 180 && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h >= 240 && h < 300) {
    [r, g, b] = [x, 0, c];
  } else if (h >= 300 && h < 360) {
    [r, g, b] = [c, 0, x];
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

export const rgbToHsv = (r: number, g: number, b: number): HSV => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
};
