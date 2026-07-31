import { PlaybackState } from '@choral/types';

export type NativeAudioPlayerEvents = {
  onPlayerDestroyed: () => void;
  onPlaybackStateChanged: (event: { playbackState: PlaybackState }) => void;
  onIsPlayingChanged: (event: { isPlaying: boolean }) => void;
  onPositionChanged: (event: { position: number }) => void;
  onDurationChanged: (event: { duration: number }) => void;
  onSongChanged: (event: { index: number }) => void;
};
