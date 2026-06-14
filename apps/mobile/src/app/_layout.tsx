import { useEffect } from 'react';
import '../../global.css';

import { Stack } from 'expo-router';
import { registerAudioPlayer, usePlayback } from '@choral/domain';
import NativeAudioPlayer from 'native-audio-player';

export default function RootLayout() {
  useEffect(() => {
    registerAudioPlayer(NativeAudioPlayer);

    NativeAudioPlayer.addListener('onIsPlayingChanged', ({ isPlaying }) => {
      usePlayback.setState({ isPlaying });
    });

    return () => {
      NativeAudioPlayer.removeAllListeners('onIsPlayingChanged');
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
