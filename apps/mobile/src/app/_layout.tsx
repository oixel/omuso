import '@/global.css';
import 'react-native-get-random-values'; // Polyfill to replace crypto.randomValues on mobile

import { Stack } from 'expo-router';
import { useAuth } from '@choral/domain';
import { useEffect } from 'react';
import { initializeNativeAudioPlayer } from '@utils/initializeNativeAudioPlayer';

const RootLayout = () => {
  const { loadCredentials, credentials, loading } = useAuth();

  async function connectToServer() {
    const success = await loadCredentials();
    if (success) {
      await initializeNativeAudioPlayer();
    }
  }

  useEffect(() => {
    connectToServer();
  }, []);

  if (loading) return null; // TODO: Keep splash screen up while authenticating

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!credentials}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!credentials}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
};

export default RootLayout;
