import { Media } from './Media';

export interface Artist extends Media {
  name: string;
  albumCount?: number;
}
