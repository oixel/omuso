import { Song } from '../media/Song';

export interface QueuedSong {
  queueId: string; // Unique UUID to allow same songs to differ from each other while in queue
  song: Song;
}
