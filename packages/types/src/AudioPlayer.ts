// Expected behavior from both NativeAudioPlayer module and WebAudioPlayer
export interface AudioPlayer {
  play: () => void;
  pause: () => void;
  togglePause: () => void;
  isPlaying: () => boolean;
  skip: () => void;
  prev: () => void;
}
