import { NativeModule, requireNativeModule } from 'expo';
import { NativeAudioPlayerEvents } from './NativeAudioPlayer.types';

declare class NativeAudioPlayerModule extends NativeModule<NativeAudioPlayerEvents> {
  play: () => void;
  pause: () => void;
  togglePause: () => void;
  isPlaying: () => boolean;
  skip: () => void;
  prev: () => void;

  //
  // TODO: REMOVE TEST FUNCTIONALITY
  //
  getTest: () => string;
  setTest: (test: string) => void;
}

// Loads the native module object from the JSI
export default requireNativeModule<NativeAudioPlayerModule>('NativeAudioPlayer');
