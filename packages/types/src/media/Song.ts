export interface Song {
  id: string;
  title: string;
  uri: string;
  artist?: string;
  album?: string;
  coverArt?: string; // Cover art's ID
  coverArtURL?: string;
}
