import { Album } from './Album';
import { Media } from './Media';

export interface Artist extends Media {
  name: string;
  coverArt?: string;
  coverArtURL?: string;
  biography?: string;
  similarArtists?: Artist[];
  albumCount?: number;
  albums?: Album[];
}
