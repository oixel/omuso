// States relating directly to current song's playback
interface PlaybackState {
  isPlaying: boolean;
  position: number;
  duration: number;
}

export interface PlaybackStore extends PlaybackState {
  syncPlayback: () => Promise<void>;
  restorePlayback: () => Promise<void>;

  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePause: () => Promise<void>;
  getIsPlaying: () => Promise<boolean>;

  seekTo: (position: number) => Promise<void>;
  prev: () => Promise<void>;
  skip: () => Promise<void>;
}
