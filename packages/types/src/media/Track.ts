export interface Track {
  id: string;
  title: string;
  isDir: boolean;
  uri: string;
  artist?: string;
  album?: string;
  coverArt?: string; // Cover art's ID
  coverArtURL?: string;
}
