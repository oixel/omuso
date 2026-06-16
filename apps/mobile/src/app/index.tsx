import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function App() {
  const router = useRouter();

  const [serverInput, setServerInput] = useState<string>('');

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-1 items-center justify-center w-full">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <Text>logging in...</Text>
      </View>
      <View className="h-1/8"></View>
      <Button title="Testing" onPress={() => router.navigate('./testing')} />
      <View className="mb-8"></View>
    </View>
  );
}
