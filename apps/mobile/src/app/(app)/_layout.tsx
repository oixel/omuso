import { initializeApp } from '@utils';
import { useAuth } from '@omuso/domain';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const AppLayout = () => {
  const { client } = useAuth();

  async function connectToServer() {
    if (client) await initializeApp(client);
  }

  useEffect(() => {
    connectToServer();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default AppLayout;
