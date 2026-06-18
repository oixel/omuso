import { Song } from '../media/Song';
import { QueuedSong } from './QueuedSong';

interface QueueState {
  index: number;
  queue: QueuedSong[];
}

export interface QueueStore extends QueueState {
  syncQueue: () => Promise<void>;
  restoreQueue: () => Promise<void>;

  setQueue: (songs: Song[]) => Promise<void>;
  updateQueue: (songs: Song[]) => Promise<void>;

  addNext: (songs: Song[]) => Promise<void>;
  addToEnd: (songs: Song[]) => Promise<void>;

  removeFromQueue: (start: number, end?: number) => Promise<void>;
}
