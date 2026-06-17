export type NativeAudioPlayerEvents = {
  onPlayerDestroyed: () => void;
  onIsPlayingChanged: (event: { isPlaying: boolean }) => void;
  onPositionChanged: (event: { position: number; duration: number }) => void;
  onTrackChanged: (event: { index: number }) => void;
};
