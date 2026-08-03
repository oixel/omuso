import { Media } from './Media';
import { Song } from './Song';

export interface Album extends Media {
  name: string;
  songCount: number;
  duration: number;
  created: string;
  year?: number;
  originalReleaseDate?: { year: number; month: number; day: number };
  artistId?: string;
  artist?: string;
  songs?: Song[];
  genres?: string[];
  coverArt?: string;
  coverArtURL?: string;
}
