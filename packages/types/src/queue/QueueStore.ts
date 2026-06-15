import { Track } from '../Track';
import { QueuedTrack } from './QueuedTrack';

interface QueueState {
  index: number;
  queue: QueuedTrack[];
}

export interface QueueStore extends QueueState {
  syncQueue: () => Promise<void>;
  restoreQueue: () => Promise<void>;

  setQueue: (tracks: Track[]) => Promise<void>;
  updateQueue: (tracks: Track[]) => Promise<void>;

  addNext: (tracks: Track[]) => Promise<void>;
  addToEnd: (tracks: Track[]) => Promise<void>;

  removeFromQueue: (start: number, end?: number) => Promise<void>;
}
