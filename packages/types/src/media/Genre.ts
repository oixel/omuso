import { Media } from './Media';

export interface Genre extends Media {
  id: string;
  songCount: number;
  albumCount: number;
}
