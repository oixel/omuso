import { QueuedTrack } from '../queue';

// Defines expected, cross-platform behavior from both NativeAudioPlayer module and WebAudioPlayer
export interface AudioPlayer {
  initialize: () => Promise<string>;
  destroy: () => Promise<void>;

  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePause: () => Promise<void>;

  seekTo: (position: number) => Promise<void>;
  playTrack: (index: number) => Promise<void>;
  skip: () => Promise<void>;
  prev: () => Promise<void>;

  getIsPlaying: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  getTrackIndex: () => Promise<number>;

  setQueue: (queue: QueuedTrack[]) => Promise<void>;
  updateQueue: (queue: QueuedTrack[]) => Promise<void>;
  removeFromQueue: (start: number, end?: number) => Promise<void>;
  addNext: (track: QueuedTrack[]) => Promise<void>;
  addToEnd: (track: QueuedTrack[]) => Promise<void>;
}
