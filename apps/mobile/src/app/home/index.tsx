import { View, Text, Button } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-1 items-center justify-center w-full">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <Text>Home Page</Text>
      </View>
      <Button title="Testing" onPress={() => router.navigate('/testing')} />
      <View className="mb-4"></View>
      <Button
        title="Log Out"
        onPress={() => {
          destroyAudioPlayer();
          logout();
          router.replace('/login');
        }}
      />
      <View className="mb-8"></View>
    </View>
  );
};

export default Home;
