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
  skip: () => void;
  prev: () => void;

  setQueue: (queue: QueuedTrack[]) => void;
  updateQueue: (queue: QueuedTrack[]) => void;
  addNext: (track: QueuedTrack[]) => void;
  addToEnd: (track: QueuedTrack[]) => void;
  removeFromQueue: (start: number, end?: number) => void;
}

// Loads the native module object from the JSI
export default requireNativeModule<NativeAudioPlayerModule>('NativeAudioPlayer');
