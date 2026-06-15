// States relating directly to current track's playback
interface PlaybackState {
  isPlaying: boolean;
  isBuffering: boolean; // TODO: add listener for isBuffering
  position: number;
  duration: number;
}

export interface PlaybackStore extends PlaybackState {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  prev: () => Promise<void>;
  skip: () => Promise<void>;
}
