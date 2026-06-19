import { Song } from '../media/Song';

export interface QueuedSong extends Song {
  queueId: string; // Unique UUID to allow same songs to differ from each other while in queue
}
