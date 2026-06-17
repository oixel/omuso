import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '@choral/domain';
import { useEffect } from 'react';
import { initializeNativeAudioPlayer } from '../util/initializeNativeAudioPlayer';

const App = () => {
  const router = useRouter();
  const { loadCredentials } = useAuth();

  async function connectToServer() {
    const success = await loadCredentials();
    if (success) {
      await initializeNativeAudioPlayer();
      router.navigate('/home');
    } else router.navigate('/login');
  }

  useEffect(() => {
    connectToServer();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-1 items-center justify-center w-full">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <Text>logging in...</Text>
      </View>
      <View className="h-1/8"></View>
      <View className="mb-8"></View>
    </View>
  );
};

export default App;
