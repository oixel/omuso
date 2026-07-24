export function resizeCoverArt(coverArt: string | undefined, size: number): string | undefined {
  return coverArt === undefined ? coverArt : coverArt + `&size=${size}`;
}
