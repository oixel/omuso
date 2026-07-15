import '@/global.css';
import 'react-native-get-random-values'; // Polyfill to replace crypto.randomValues on mobile
import { Stack } from 'expo-router';

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default RootLayout;
