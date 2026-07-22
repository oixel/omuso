import { View, Text, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { Genre, GetGenresResult } from '@choral/types';
import { useEffect, useState } from 'react';
import { useQueue, usePlayback } from '@choral/domain';

import MediaList from '@components/MediaList';
import GenreEntry from '@components/MediaEntries/GenreEntry';

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const client = useAuth((state) => state.client);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [genres, setGenres] = useState<Genre[]>([]);

  const { removeFromQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);
  const { togglePause, prev, skip } = usePlayback();
  const isPlaying = usePlayback((state) => state.isPlaying);

  const loadGenres = async (): Promise<GetGenresResult> => {
    if (!client) return { success: false };

    const result = await client.getGenres();
    if (result.genres) setGenres(result.genres);

    return result;
  };

  const initialLoad = async () => {
    await loadGenres();
    setIsInitialLoad(false);
  };

  useEffect(() => {
    if (!isInitialLoad) {
      setGenres([]);
      loadGenres();
    }
  }, []);

  useEffect(() => {
    initialLoad();

    return () => {
      setGenres([]);
    };
  }, [client]);

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
      <View
        style={{
          height: 110, // TODO: look into how to make height fit content rather than being manually set
        }}
      >
        <MediaList
          data={genres}
          Entry={GenreEntry}
          horizontal={true}
          separator={() => <View style={{ width: 6 }} />}
        />
      </View>
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
