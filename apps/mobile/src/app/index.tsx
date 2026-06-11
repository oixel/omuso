import TrackPlayer, { MediaItem, useActiveMediaItem, useIsPlaying } from '@rntp/player';
import { Asset } from 'expo-asset';
import { Button, Text, View } from 'react-native';
import { Auth } from '@choral/domain';

export default function App() {
  const playing = useIsPlaying();
  const song = useActiveMediaItem();

  async function togglePause() {
    if (song === null) {
      // TODO: Remove (only for initial debugging)
      // Loads MP3 file into an asset to be usable within the app instance
      const songAsset = await Asset.fromModule(require('../../test.mp3')).downloadAsync();

      const testSong: MediaItem = {
        url: songAsset.localUri as string,
      };

      TrackPlayer.setMediaItems([testSong, testSong]);
    }

    if (playing) TrackPlayer.pause();
    else TrackPlayer.play();
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Welcome to Choral!</Text>
      <Text>{song ? song.title : 'No song loaded'}</Text>
      <Button title={playing ? 'Pause' : 'Play'} onPress={togglePause} />
      <Button title={'Store'} onPress={Auth.setCredentials}></Button>
      <Button title={'Get'} onPress={Auth.getCredentials}></Button>
      <Button title={'Wipe'} onPress={Auth.deleteCredentials}></Button>
    </View>
  );
}
