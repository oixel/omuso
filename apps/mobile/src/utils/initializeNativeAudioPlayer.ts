import { registerAudioPlayer, usePlayback, useQueue } from '@choral/domain';
import { PlaybackState } from '@choral/types';
import NativeAudioPlayer from 'native-audio-player';

export async function initializeNativeAudioPlayer() {
  await registerAudioPlayer(NativeAudioPlayer);

  NativeAudioPlayer.addListener('onPlayerDestroyed', () => {
    NativeAudioPlayer.removeAllListeners('onPlaybackStateChanged');
    NativeAudioPlayer.removeAllListeners('onIsPlayingChanged');
    NativeAudioPlayer.removeAllListeners('onPositionChanged');
    NativeAudioPlayer.removeAllListeners('onDurationChanged');
    NativeAudioPlayer.removeAllListeners('onSongChanged');
    NativeAudioPlayer.removeAllListeners('onPlayerDestroyed');
  });

  NativeAudioPlayer.addListener('onPlaybackStateChanged', ({ playbackState }) => {
    usePlayback.setState({ playbackState });
  });

  NativeAudioPlayer.addListener('onIsPlayingChanged', ({ isPlaying }) => {
    usePlayback.setState({ isPlaying });
  });

  NativeAudioPlayer.addListener('onPositionChanged', ({ position }) => {
    usePlayback.setState({ position });
  });

  NativeAudioPlayer.addListener('onDurationChanged', ({ duration }) => {
    usePlayback.setState({ duration });
  });

  NativeAudioPlayer.addListener('onSongChanged', ({ index }) => {
    useQueue.setState({ index });
  });

  var playbackState: PlaybackState;

  // Poll repeatedly until the audio player is fully initialized
  while (playbackState === undefined) {
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
