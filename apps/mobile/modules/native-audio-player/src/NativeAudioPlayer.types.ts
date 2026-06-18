export type NativeAudioPlayerEvents = {
  onPlayerDestroyed: () => void;
  onIsPlayingChanged: (event: { isPlaying: boolean }) => void;
  onPositionChanged: (event: { position: number; duration: number }) => void;
  onSongChanged: (event: { index: number }) => void;
};
