import { NativeModule, requireNativeModule } from 'expo';
import { NativeAudioPlayerEvents } from './NativeAudioPlayer.types';

declare class NativeAudioPlayer extends NativeModule<NativeAudioPlayerEvents> {
  getTest: () => string;
}

// Loads the native module object from the JSI
export default requireNativeModule<NativeAudioPlayer>('NativeAudioPlayer');
