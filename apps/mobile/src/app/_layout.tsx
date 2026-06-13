import { useEffect } from 'react';
import '../../global.css';

import { Stack } from 'expo-router';
import { Asset } from 'expo-asset';
import { Track } from '@choral/types';
import NativeAudioPlayer from 'native-audio-player';

export default function RootLayout() {
  async function loadSong() {
    // TODO: Remove (only for initial debugging)
    // Loads MP3 file into an asset to be usable within the app instance
    const songAsset = await Asset.fromModule(require('../../assets/test.mp3')).downloadAsync();

    const testSong: Track = {
      id: '001',
      uri: songAsset.localUri as string,
      title: 'Test',
      artist: 'Test',
      album: 'Test',
      coverArtUri: null,
    };

    NativeAudioPlayer.setQueue([testSong, testSong]);
  }

  useEffect(() => {
    loadSong();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
