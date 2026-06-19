import { NativeModule, requireNativeModule } from 'expo';
import { NativeAudioPlayerEvents } from './NativeAudioPlayer.types';
import { AudioPlayer, QueuedSong } from '@choral/types';

declare class NativeAudioPlayerModule
  extends NativeModule<NativeAudioPlayerEvents>
  implements AudioPlayer
{
  initialize: () => Promise<string>;
  destroy: () => Promise<void>;

  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePause: () => Promise<void>;

  seekTo: (position: number) => Promise<void>;
  playSong: (index: number) => Promise<void>;
  skip: () => Promise<void>;
  prev: () => Promise<void>;

  getIsPlaying: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getDuration: () => Promise<number>;
  getSongIndex: () => Promise<number>;
  getPlaybackState: () => Promise<string>;

  setQueue: (queue: QueuedSong[]) => Promise<void>;
  updateQueue: (queue: QueuedSong[]) => Promise<void>;
  addNext: (songs: QueuedSong[]) => Promise<void>;
  addToEnd: (songs: QueuedSong[]) => Promise<void>;
  removeFromQueue: (start: number, end?: number) => Promise<void>;
}

// Loads the native module object from the JSI
export default requireNativeModule<NativeAudioPlayerModule>('NativeAudioPlayer');
