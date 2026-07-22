import { View, Text, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { useQueue, usePlayback } from '@choral/domain';
import GenreMediaList from '@/src/components/MediaLists/GenreMediaList';

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const { removeFromQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);
  const { togglePause, prev, skip } = usePlayback();
  const isPlaying = usePlayback((state) => state.isPlaying);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-shrink pt-44 pb-4 items-center justify-center w-full gap-2 mb-12">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <Text className="text-xl font-bold color-white my-5">
          Now Playing: {queue[index]?.title}
        </Text>
        <View className="flex flex-row gap-2">
          <Button title="🚮" onPress={() => removeFromQueue(index)}></Button>
          <Button title="Prev" onPress={prev}></Button>
          <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePause}></Button>
          <Button title="Skip" onPress={skip}></Button>
        </View>
      </View>
      <GenreMediaList />
      <View className="flex flex-row gap-2">
        <Pressable className="h-12 bg-blue-700 my-4 px-4 flex justify-center mb-12 border border-white rounded-md">
          <Text className="text-xl text-white font-bold">Artists</Text>
        </Pressable>
        <Pressable className="h-12 bg-blue-700 my-4 px-4 flex justify-center mb-12 border border-white rounded-md">
          <Text className="text-xl text-white font-bold">Albums</Text>
        </Pressable>
        <Pressable className="h-12 bg-blue-700 my-4 px-4 flex justify-center mb-12 border border-white rounded-md">
          <Text className="text-xl text-white font-bold">Genres</Text>
        </Pressable>
        <Pressable
          onPress={() => router.navigate('/search')}
          className="h-12 bg-blue-700  my-4 px-4 flex justify-center mb-12 border border-white rounded-md"
        >
          <Text className="text-md text-white font-bold">Search</Text>
        </Pressable>
      </View>
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
