import { initializeChoral } from '@/src/utils/initializeChoral';
import { useAuth } from '@choral/domain';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

const AppLayout = () => {
  const { client } = useAuth();

  async function connectToServer() {
    if (client) await initializeChoral(client);
  }

  useEffect(() => {
    connectToServer();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AppLayout;
