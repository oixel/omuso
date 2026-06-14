import { Track } from './Track';

// Expected behavior from both NativeAudioPlayer module and WebAudioPlayer
export interface AudioPlayer {
  play: () => void;
  pause: () => void;
  togglePause: () => void;
  isPlaying: () => boolean;
  skip: () => void;
  prev: () => void;

  setQueue: (queue: Track[]) => void;
  updateQueue: (queue: Track[]) => void;
  removeFromQueue: (start: number, end: number | null) => void;
  addNext: (track: Track) => void;
  addToEnd: (track: Track) => void;
}
