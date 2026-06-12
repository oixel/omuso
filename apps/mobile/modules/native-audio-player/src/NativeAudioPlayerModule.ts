import { NativeModule, requireNativeModule } from 'expo';
import { NativeAudioPlayerEvents } from './NativeAudioPlayer.types';

declare class NativeAudioPlayerModule extends NativeModule<NativeAudioPlayerEvents> {
  getTest: () => string;
  setTest: (test: string) => void;
}

// Loads the native module object from the JSI
export default requireNativeModule<NativeAudioPlayerModule>('NativeAudioPlayer');
