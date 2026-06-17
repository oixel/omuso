export interface Track {
  id: string;
  title: string;
  isDir: boolean;
  uri: string;
  artist?: string;
  album?: string;
  coverArtUri?: string;
}
