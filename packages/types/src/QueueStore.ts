import { Track } from './Track';

interface QueueState {
  index: number;
  queue: Track[];
}

export interface QueueStore extends QueueState {
  setQueue: (tracks: Track[]) => Promise<void>;
}
