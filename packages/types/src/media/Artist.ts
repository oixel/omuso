import { Album } from './Album';
import { Media } from './Media';

export interface Artist extends Media {
  name: string;
  coverArt?: string;
  coverArtURL?: string;
  artistPictureURLs?: {
    small: string;
    medium: string;
    big: string;
    xl: string;
  };
  albumCount?: number;
  albums?: Album[];
}
