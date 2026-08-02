import { Media } from './Media';

export interface Song extends Media {
  title: string;
  uri: string;
  artistId?: string;
  artist?: string;
  albumId?: string;
  album?: string;
  track?: number;
  year?: number;
  genres?: string[];
  coverArt?: string; // Cover art's ID
  coverArtURL?: string;
}
