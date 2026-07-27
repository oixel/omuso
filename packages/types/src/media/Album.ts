import { Media } from './Media';

export interface Album extends Media {
  id: string;
  name: string;
  songCount: number;
  duration: number;
  created: string;
  artistId?: string;
  genres?: string[];
  coverArt?: string;
  coverArtURL?: string;
}
