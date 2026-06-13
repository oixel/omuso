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
      <Button
        title={'Module Get Test'}
        onPress={() => console.log(NativeAudioPlayer.getTest())}
      ></Button>
      <Button
        title={'Module Set Test'}
        onPress={() => NativeAudioPlayer.setTest('Right back at ya!')}
      ></Button>
      <Button
        title={'Module NativeAudioPlayer isPlaying() Test'}
        onPress={() => console.log('isPlaying =', NativeAudioPlayer.isPlaying())}
      ></Button>
    </View>
  );
}
