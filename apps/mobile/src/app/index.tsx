import { Button, Text, View } from 'react-native';
import { Auth } from '@choral/domain';

import NativeAudioPlayer from 'native-audio-player';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    NativeAudioPlayer.addListener('onSetTest', (event) => {
      console.log('Event heard:', event.message);
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Welcome to Choral!</Text>
      <Button title={'Store'} onPress={Auth.setCredentials}></Button>
      <Button title={'Get'} onPress={Auth.getCredentials}></Button>
      <Button title={'Wipe'} onPress={Auth.deleteCredentials}></Button>

      <Button title={'Play / Pause'} onPress={() => NativeAudioPlayer.togglePause()}></Button>
      <Button title={'Prev'} onPress={() => NativeAudioPlayer.prev()}></Button>
      <Button title={'Skip'} onPress={() => NativeAudioPlayer.skip()}></Button>
    </View>
  );
}
