export type NativeAudioPlayerEvents = {
  onIsPlayingChanged: (event: { isPlaying: boolean }) => void;
  onPositionChanged: (event: { position: number; duration: number }) => void;
  onTrackChanged: (event: { index: number }) => void;
};
