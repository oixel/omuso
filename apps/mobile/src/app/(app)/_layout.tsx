import { initializeChoral } from '@/src/utils/initializeChoral';
import { useAuth } from '@choral/domain';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AppLayout = () => {
  const { client } = useAuth();

  async function connectToServer() {
    if (client) await initializeChoral(client);
  }

  useEffect(() => {
    connectToServer();
  }, []);

  return (
    <GestureHandlerRootView>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
};

export default AppLayout;
