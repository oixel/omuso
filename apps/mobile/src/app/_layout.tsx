import { useEffect } from 'react';
import '../../global.css';

import { Stack } from 'expo-router';
import { registerAudioPlayer, usePlayback, useQueue } from '@choral/domain';
import NativeAudioPlayer from 'native-audio-player';

export default function RootLayout() {
  useEffect(() => {
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
