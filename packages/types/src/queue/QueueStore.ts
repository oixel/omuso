import { Media } from '../media';
import { Song } from '../media/Song';
import { QueuedSong } from './QueuedSong';

interface QueueState {
  index: number;
  queue: QueuedSong[];
}

export interface QueueStore extends QueueState {
  syncQueue: () => Promise<void>;
  restoreQueue: () => Promise<void>;
  updateMedia: (media: Media) => Promise<void>;

  setQueue: (songs: Song[]) => Promise<void>;
  updateQueue: () => Promise<void>;

  addNext: (songs: Song[]) => Promise<void>;
  addToEnd: (songs: Song[]) => Promise<void>;

  removeFromQueue: (start: number, end?: number) => Promise<void>;
}
