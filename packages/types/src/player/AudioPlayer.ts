import { QueuedTrack } from '../queue';

// Defines expected, cross-platform behavior from both NativeAudioPlayer module and WebAudioPlayer
export interface AudioPlayer {
  play: () => void;
  pause: () => void;
  togglePause: () => void;
  seekTo: (position: number) => void;
  skip: () => void;
  prev: () => void;

  setQueue: (queue: QueuedTrack[]) => void;
  updateQueue: (queue: QueuedTrack[]) => void;
  removeFromQueue: (start: number, end?: number) => void;
  addNext: (track: QueuedTrack[]) => void;
  addToEnd: (track: QueuedTrack[]) => void;
}
