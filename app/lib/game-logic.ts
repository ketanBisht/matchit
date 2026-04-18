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

export const calculateScore = (target: Color, match: Color): number => {
  const dr = target.r - match.r;
  const dg = target.g - match.g;
  const db = target.b - match.b;
  
  const distance = Math.sqrt(dr * dr + dg * dg + db * db);
  const maxDistance = Math.sqrt(255 * 255 + 255 * 255 + 255 * 255);
  
  // Score is 100 at 0 distance, 0 at max distance
  // Using a power function to make it more rewarding for close matches
  const linearScore = 1 - distance / maxDistance;
  const weight = 2; // Higher weight makes it harder to get high scores unless very close
  const curvedScore = Math.pow(linearScore, weight);
  
  return Math.round(curvedScore * 100);
};

export const colorToRgb = (color: Color): string => 
  `rgb(${color.r}, ${color.g}, ${color.b})`;

export const colorToHex = (color: Color): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
};
