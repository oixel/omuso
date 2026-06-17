export interface Album {
  id: string;
  name: string;
  songCount: number;
  duration: number;
  created: string;
  artist?: string;
  coverArt?: string;
  coverArtURL?: string;
}
