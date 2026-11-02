import { hexToRGB } from './hexToRGB';

// Helper to convert from RGB channels' 0 to 255 to a linear light value between 0 and 1
function channel(c: number) {
  const normalized = c / 255;
  return normalized <= 0.03928
    ? normalized / 12.92 // Return a straight line for small values
    : ((normalized + 0.055) / 1.055) ** 2.4; // Otherwise, return gamma curve
}

// Returns relative luminance based on WCAG from 0 (black) to 1 (white)
export function luminance(hex: string) {
  const [r, g, b] = hexToRGB(hex);

  // Apply weight based on human eye sensitivity (most sensitive to green > red > blue)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// Return black or white text based on threshold of equal contrast (roughly 0.179)
export function getTextColor(background: string) {
  return luminance(background) > 0.3 ? '#000000' : '#ffffff';
}
