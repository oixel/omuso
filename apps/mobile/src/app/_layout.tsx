import { useEffect } from 'react';
import '../../global.css';

import { Stack } from 'expo-router';
import { registerAudioPlayer, useAuth, usePlayback, useQueue } from '@choral/domain';
import NativeAudioPlayer from 'native-audio-player';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  const { loadCredentials } = useAuth();
  const { syncQueue, restoreQueue } = useQueue();
  const { syncPlayback, restorePlayback } = usePlayback();

  async function connectToServer() {
    const success = await loadCredentials();
    if (success) {
      await restoreAudioPlayer();
      router.navigate('./testing');
    } else {
      router.navigate('./login');
    }
  }

  async function restoreAudioPlayer() {
    registerAudioPlayer(NativeAudioPlayer);

    NativeAudioPlayer.addListener('onIsPlayingChanged', ({ isPlaying }) => {
      usePlayback.setState({ isPlaying });
    });

    NativeAudioPlayer.addListener('onPositionChanged', ({ position, duration }) => {
      usePlayback.setState({ position, duration });
    });

    NativeAudioPlayer.addListener('onTrackChanged', ({ index }) => {
      useQueue.setState({ index });
    });

    const playbackState = await NativeAudioPlayer.getPlaybackState();

    if (playbackState == 'READY') {
      // If player is ready (loaded), then ensure app's data matches any progress done with app closed (e.g. swiped out of recents)
      syncQueue();
      syncPlayback();
    } else {
      // Otherwise, restore previous session in AudioPlayer from persistent data
      restoreQueue();
      restorePlayback();
    }
  }

  useEffect(() => {
    connectToServer();

    return () => {
      NativeAudioPlayer.removeAllListeners('onIsPlayingChanged');
      NativeAudioPlayer.removeAllListeners('onPositionChanged');
      NativeAudioPlayer.removeAllListeners('onTrackChanged');
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
