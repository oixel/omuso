import { NativeModule, requireNativeModule } from 'expo';
import { NativeAudioPlayerEvents } from './NativeAudioPlayer.types';
import { AudioPlayer, QueuedTrack } from '@choral/types';

declare class NativeAudioPlayerModule
  extends NativeModule<NativeAudioPlayerEvents>
  implements AudioPlayer
{
  play: () => void;
  pause: () => void;
  togglePause: () => void;

  seekTo: (position: number) => void;
  playTrack: (index: number) => void;
  skip: () => void;
  prev: () => void;

  getIsPlaying: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  getTrackIndex: () => Promise<number>;
  getPlaybackState: () => Promise<string>;

  setQueue: (queue: QueuedTrack[]) => void;
  updateQueue: (queue: QueuedTrack[]) => void;
  addNext: (track: QueuedTrack[]) => void;
  addToEnd: (track: QueuedTrack[]) => void;
  removeFromQueue: (start: number, end?: number) => void;
}

// Loads the native module object from the JSI
export default requireNativeModule<NativeAudioPlayerModule>('NativeAudioPlayer');
