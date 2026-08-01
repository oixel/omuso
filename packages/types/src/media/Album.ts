import { Media } from './Media';

export interface Album extends Media {
  name: string;
  songCount: number;
  duration: number;
  created: string;
  artistId?: string;
  artist?: string;
  genres?: string[];
  coverArt?: string;
  coverArtURL?: string;
}
