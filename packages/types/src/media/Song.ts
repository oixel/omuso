import { Media } from './Media';

export interface Song extends Media {
  title: string;
  uri: string;
  artistId?: string;
  albumId?: string;
  genres?: string[];
  coverArt?: string; // Cover art's ID
  coverArtURL?: string;
}
