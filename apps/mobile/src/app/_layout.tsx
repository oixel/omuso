import '@/global.css';
import 'react-native-get-random-values'; // Polyfill to replace crypto.randomValues on mobile
import { Stack } from 'expo-router';
import { useAuth } from '@choral/domain';
import { useEffect, useState } from 'react';

const RootLayout = () => {
  const { loadCredentials, credentials, loading } = useAuth();

  useEffect(() => {
    loadCredentials();
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
