import { Media } from './Media';

export interface Artist extends Media {
  name: string;
  coverArt?: string;
  coverArtURL?: string;
}
