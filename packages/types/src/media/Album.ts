import { Media } from './Media';

export interface Album extends Media {
  id: string;
  name: string;
  songCount: number;
  duration: number;
  created: string;
  artist?: string;
  coverArt?: string;
  iconCoverArtURL?: string;
  fullSizeCoverArtURL?: string;
}
