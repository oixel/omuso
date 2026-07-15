import { Media } from './Media';

export interface Song extends Media {
  id: string;
  title: string;
  uri: string;
  artist?: string;
  album?: string;
  coverArt?: string; // Cover art's ID
  coverArtURL?: string;
}
