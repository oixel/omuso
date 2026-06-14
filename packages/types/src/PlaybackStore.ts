interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
}

export interface PlaybackStore extends PlaybackState {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePause: () => Promise<void>;
  prev: () => Promise<void>;
  skip: () => Promise<void>;
}
