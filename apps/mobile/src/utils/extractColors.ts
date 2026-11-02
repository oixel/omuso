import { hexToRGB } from './hexToRGB';
import { getColors } from 'react-native-image-colors';

interface Colors {
  primary: string;
  secondary: string;
}

// Return difference between the primary and secondary colors
function distance(a: string, b: string) {
  const [r1, g1, b1] = hexToRGB(a);
  const [r2, g2, b2] = hexToRGB(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 + b2) ** 2);
}

// amount > 0 lightens the color, < 0 darkens it
function shift(hex: string, amount: number) {
  const [r, g, b] = hexToRGB(hex).map((c) =>
    Math.max(0, Math.min(255, Math.round(c + (amount > 0 ? 255 - c : c) * amount)))
  );

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

const MIN_DISTANCE = 40; // Minimum different in primary and secondary color

export async function extractColors(url: string): Promise<Colors> {
  const colors = await getColors(url, { cache: true, key: url });

  if (colors.platform === 'ios') {
    const primary = colors.primary;
    const options = [colors.secondary, colors.detail];

    // Attempt to find a valid secondary color from the unmodified options, otherwise shift until distinct enough
    const secondary =
      options.find((c) => distance(primary, c) > MIN_DISTANCE) ?? shift(primary, 0.25);
    return { primary, secondary };
  }

  if (colors.platform === 'android') {
    const primary = colors.dominant;

    // Android has a lot more potential unmodified colors to use as secondary
    const options = [
      colors.vibrant,
      colors.lightVibrant,
      colors.darkVibrant,
      colors.muted,
      colors.lightMuted,
      colors.darkMuted,
    ];
    const secondary =
      options.find((c) => c && distance(primary, c) > MIN_DISTANCE) ?? shift(primary, 0.25);
    return { primary, secondary };
  }

  // Web fallback
  return {
    primary: colors.dominant,
    secondary: colors.vibrant,
  };
}
