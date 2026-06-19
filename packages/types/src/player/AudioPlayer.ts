import { QueuedSong } from '../queue';

// Defines expected, cross-platform behavior from both NativeAudioPlayer module and WebAudioPlayer
export interface AudioPlayer {
  initialize: () => Promise<string>;
  destroy: () => Promise<void>;

  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePause: () => Promise<void>;

  seekTo: (position: number) => Promise<void>;
  playSong: (index: number) => Promise<void>;
  skip: () => Promise<void>;
  prev: () => Promise<void>;

  getIsPlaying: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  getSongIndex: () => Promise<number>;

  setQueue: (queue: QueuedSong[]) => Promise<void>;
  updateQueue: (queue: QueuedSong[]) => Promise<void>;
  removeFromQueue: (start: number, end?: number) => Promise<void>;
  addNext: (songs: QueuedSong[]) => Promise<void>;
  addToEnd: (songs: QueuedSong[]) => Promise<void>;
}
