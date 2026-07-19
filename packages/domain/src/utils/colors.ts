// Hash string input into a single number to then be placed into HSL's 360 hue range
export function convertStringToColor(
  str: string,
  shift: number = 5, // Should ideally be a prime number to avoid collisions
  saturation: number = 100,
  lightness: number = 80
): string {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    // Equivalent of character's unicode value + (hash * (2^k - 1))
    hash = str.charCodeAt(i) + ((hash << shift) - hash);
  }
  return `hsl(${hash % 360}, ${Math.min(saturation, 100)}%, ${Math.min(lightness, 100)}%)`;
}
