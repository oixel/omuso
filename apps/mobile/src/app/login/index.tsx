import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { validateServer } from '@choral/domain';

export default function Login() {
  const router = useRouter();

  const [serverInput, setServerInput] = useState<string>('');

  async function awaitResult() {
    const result = await validateServer(serverInput);
    if (result) {
      if (
        result.openSubsonicExtensions.some(
          (extension) => extension['name'] == 'apiKeyAuthentication'
        )
      )
        console.log('TODO: Login with API Key');
      else console.log('TODO: Login with username / password');
    } else {
      console.log('TODO: Display error text for invalid server');
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-1 items-center justify-center w-full">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <TextInput
          onChangeText={(e) => setServerInput(e)}
          className="bg-white w-2/3 mb-4 color-black"
        ></TextInput>
        <Button
          title="Connect"
          onPress={() => {
            awaitResult();
          }}
        />
      </View>
      <View className="h-1/8"></View>
      <Button title="Testing" onPress={() => router.navigate('./testing')} />
      <View className="mb-8"></View>
    </View>
  );
}
