import { Button, Text, View } from 'react-native';
import { Auth, usePlayback } from '@choral/domain';

import { useEffect } from 'react';

import { Asset } from 'expo-asset';
import { Track } from '@choral/types';
import NativeAudioPlayer from 'native-audio-player';

export default function App() {
  const { togglePause, prev, skip, getIsPlaying } = usePlayback();
  let queue: Track[] = [];

  async function loadSong() {
    // TODO: Remove (only for initial debugging)
    // Loads MP3 file into an asset to be usable within the app instance
    const testSong1Asset = await Asset.fromModule(require('../../assets/test.mp3')).downloadAsync();

    const testSong1: Track = {
      id: queue.length.toString(),
      uri: testSong1Asset.localUri as string,
      title: 'Test',
      artist: 'Test',
      album: 'Test',
      coverArtUri: null,
    };

    queue.push(testSong1, testSong1);

    NativeAudioPlayer.setQueue(queue);
  }

  useEffect(() => {
    loadSong();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Welcome to Choral!</Text>
      <Button title={'Store'} onPress={Auth.setCredentials}></Button>
      <Button title={'Get'} onPress={Auth.getCredentials}></Button>
      <Button title={'Wipe'} onPress={Auth.deleteCredentials}></Button>

      <Button title={'Play / Pause'} onPress={togglePause}></Button>
      <Button title={'Prev'} onPress={prev}></Button>
      <Button title={'Skip'} onPress={skip}></Button>
      <Button title={'Get isPlaying'} onPress={getIsPlaying}></Button>
    </View>
  );
}
