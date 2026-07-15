import { View, Text, Button, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth, useDebounce } from '@choral/domain';
import { SearchResult, Song } from '@choral/types';
import { useEffect, useRef, useState } from 'react';
import { useQueue, usePlayback } from '@choral/domain';

import MediaList from '@components/MediaList';
import SongEntry from '@components/MediaEntries/SongEntry';

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const client = useAuth((state) => state.client);

  const PAGE_SIZE = 200;

  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // Debounces every time search is updated
  const latestQuery = useRef('');

  const { removeFromQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);
  const { togglePause, prev, skip } = usePlayback();
  const isPlaying = usePlayback((state) => state.isPlaying);

  const loadSongs = async (
    query: string,
    songCount: number,
    newPage: number
  ): Promise<SearchResult> => {
    if (!client) return { success: false };

    latestQuery.current = query;
    setPage(newPage);

    setIsLoadingSongs(true);

    const result = await client.search({
      query: query,
      artistCount: 0,
      albumCount: 0,
      songCount,
      songOffset: newPage * songCount,
    });

    // Discard current result if a newer query exists
    if (latestQuery.current !== query) return result;

    if (result?.songs) {
      const newSongs = result.songs; // Capture narrowed value to use in setSongs closure
      setSongs((prev) => [...prev, ...newSongs]);
    }

    setIsLoadingSongs(false);

    return result;
  };

  const initialLoad = async () => {
    await loadSongs(search, PAGE_SIZE, 0);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    if (!isInitialLoad) {
      setSongs([]);
      setPage(0);
      setHasReachedEnd(false);
      loadSongs(debouncedSearch, PAGE_SIZE, 0);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    initialLoad();

    return () => {
      setSongs([]);
    };
  }, [client]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-shrink pt-44 pb-8 items-center justify-center w-full gap-2">
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
        <TextInput
          className="bg-white w-2/3 my-4 color-black placeholder:color-gray-600"
          autoCapitalize="none"
          autoCorrect={false}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View className="flex-auto w-full mb-20">
        {!songs.length && (
          <View className="w-full flex-1 flex justify-center items-center">
            <Text className="font-bold color-white">
              {!isInitialLoad && !isLoadingSongs && songs.length == 0
                ? 'No results found'
                : 'Loading songs...'}
            </Text>
          </View>
        )}
        {songs.length > 0 && (
          <MediaList
            data={songs}
            Entry={SongEntry}
            footer={() => (
              <View className="flex items-center justify-center py-2">
                {isLoadingSongs && (
                  <Text className="color-blue-200 font-medium text-lg">Loading...</Text>
                )}
                {hasReachedEnd && (
                  <Text className="color-blue-200 font-medium text-lg">End of results</Text>
                )}
              </View>
            )}
            handleEndReached={async () => {
              if (isInitialLoad || isLoadingSongs || hasReachedEnd) return;

              const result = await loadSongs(search, PAGE_SIZE, page + 1);
              if (!result.songs?.length || result.songs.length < PAGE_SIZE) setHasReachedEnd(true);
            }}
          />
        )}
      </View>
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
