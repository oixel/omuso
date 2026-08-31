import { Album } from './Album';
import { Media } from './Media';

export type ArtistImageURLs = {
  small: string;
  medium: string;
  big: string;
  xl: string;
};

export interface Artist extends Media {
  name: string;
  coverArt?: string;
  coverArtURL?: string;
  artistImageURLs?: ArtistImageURLs;
  biography?: string;
  similarArtists?: Artist[];
  albumCount?: number;
  albums?: Album[];
}
