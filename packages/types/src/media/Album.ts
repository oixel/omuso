import { UnprocessedSong } from '../requests';
import { Media } from './Media';
import { Song } from './Song';

export interface Album extends Media {
  name: string;
  songCount: number;
  duration: number;
  created: string;
  artistId?: string;
  artist?: string;
  song?: UnprocessedSong[];
  genres?: string[];
  coverArt?: string;
  coverArtURL?: string;
}
