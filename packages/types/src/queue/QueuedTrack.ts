import { Track } from '../media/Track';

export interface QueuedTrack {
  queueId: string; // Unique UUID to allow same tracks to differ from each other while in queue
  track: Track;
}
