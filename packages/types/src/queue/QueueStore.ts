import { Track } from '../Track';
import { QueuedTrack } from './QueuedTrack';

interface QueueState {
  index: number;
  queue: QueuedTrack[];
}

export interface QueueStore extends QueueState {
  setQueue: (tracks: Track[]) => Promise<void>;
}
