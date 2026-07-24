import { Media } from './Media';

export interface Artist extends Media {
  id: string;
  name: string;
  coverArt?: string;
  coverArtURL?: string;
}
