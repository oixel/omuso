import { PlaybackState } from './PlaybackState';

// States relating directly to current song's playback
interface AudioPlaybackState {
  playbackState: PlaybackState;
  isPlaying: boolean;
  position: number;
  duration: number;
}

export interface PlaybackStore extends AudioPlaybackState {
  syncPlayback: () => Promise<void>;
  restorePlayback: () => Promise<void>;

  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePause: () => Promise<void>;
  getPlaybackState: () => Promise<PlaybackState>;
  getIsPlaying: () => Promise<boolean>;

  seekTo: (position: number) => Promise<void>;
  prev: () => Promise<void>;
  skip: () => Promise<void>;
  restartOrPrev: (queue?: number) => Promise<void>;
}
