import { registerAudioPlayer, usePlayback, useQueue } from '@choral/domain';
import NativeAudioPlayer from 'native-audio-player';

export async function initializeNativeAudioPlayer() {
  await registerAudioPlayer(NativeAudioPlayer);

  NativeAudioPlayer.addListener('onPlayerDestroyed', () => {
    NativeAudioPlayer.removeAllListeners('onIsPlayingChanged');
    NativeAudioPlayer.removeAllListeners('onPositionChanged');
    NativeAudioPlayer.removeAllListeners('onTrackChanged');
    NativeAudioPlayer.removeAllListeners('onPlayerDestroyed');
  });

  NativeAudioPlayer.addListener('onIsPlayingChanged', ({ isPlaying }) => {
    usePlayback.setState({ isPlaying });
  });

  NativeAudioPlayer.addListener('onPositionChanged', ({ position, duration }) => {
    usePlayback.setState({ position, duration });
  });

  NativeAudioPlayer.addListener('onTrackChanged', ({ index }) => {
    useQueue.setState({ index });
  });

  var playbackState = null;

  // Poll repeatedly until the audio player is fully initialized
  while (playbackState == null) {
    playbackState = await NativeAudioPlayer.getPlaybackState();
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  if (playbackState == 'READY') {
    // If player is ready (loaded), then ensure app's data matches any progress done with app closed (e.g. swiped out of recents)
    useQueue.getState().syncQueue();
    usePlayback.getState().syncPlayback();
  } else {
    // Otherwise, restore previous session in AudioPlayer from persistent data
    useQueue.getState().restoreQueue();
    usePlayback.getState().restorePlayback();
  }
}
