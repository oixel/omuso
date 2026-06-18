import {
  View,
  Text,
  Button,
  TouchableOpacity,
  TouchableOpacityProps,
  TextInput,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth, useDebounce } from '@choral/domain';
import { FlashList } from '@shopify/flash-list';
import { SearchResult, Track } from '@choral/types';
import { useEffect, useRef, useState } from 'react';
import TextTicker from 'react-native-text-ticker';

interface TrackEntryProps {
  track: Track;
  touchableProps?: TouchableOpacityProps;
}

const TrackEntry: React.FC<TrackEntryProps> = ({ track, touchableProps }) => (
  <TouchableOpacity
    className="p-3 flex flex-row justify-start items-center max-h-20 gap-3 min-w-full"
    {...touchableProps}
  >
    <Image
      style={{ height: '100%', aspectRatio: 1 }}
      source={{ uri: track.coverArtURL }}
      contentFit="cover"
      recyclingKey={track.id}
      cachePolicy="memory-disk"
      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
    />
    <View className="border-b border-blue-500 flex-1 h-full">
      <TextTicker
        scrollSpeed={25}
        marqueeDelay={1500}
        repeatSpacer={30}
        easing={Easing.linear}
        animationType="scroll"
        className="color-white font-medium text-xl"
      >
        {track.title || 'Untitled Track'}
      </TextTicker>
      <TextTicker
        scrollSpeed={25}
        marqueeDelay={1500}
        repeatSpacer={30}
        easing={Easing.linear}
        animationType="scroll"
        style={{ lineHeight: 18, fontSize: 15 }}
        className="color-blue-200"
      >
        {track.artist || 'Unknown Artist'}
      </TextTicker>
    </View>
  </TouchableOpacity>
);

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const client = useAuth((state) => state.client);

  const PAGE_SIZE = 200;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [page, setPage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // Debounces every time search is updated
  const latestQuery = useRef('');

  const loadTracks = async (
    query: string,
    trackCount: number,
    newPage: number
  ): Promise<SearchResult> => {
    if (!client) return { success: false };

    latestQuery.current = query;
    setPage(newPage);

    setIsLoadingTracks(true);

    const result = await client.search({
      query: query,
      artistCount: 0,
      albumCount: 0,
      trackCount,
      trackOffset: newPage * trackCount,
    });

    // Discard current result if a newer query exists
    if (latestQuery.current !== query) return result;

    if (result?.tracks) {
      const newTracks = result.tracks; // Capture narrowed value to use in setTracks closure
      setTracks((prev) => [...prev, ...newTracks]);
    }

    setIsLoadingTracks(false);

    return result;
  };

  const initialLoad = async () => {
    await loadTracks(search, PAGE_SIZE, 0);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    if (!isInitialLoad) {
      setTracks([]);
      setPage(0);
      setHasReachedEnd(false);
      loadTracks(debouncedSearch, PAGE_SIZE, 0);
    }
  }, [debouncedSearch]);

  const handleEndReached = async () => {
    if (isInitialLoad || isLoadingTracks || hasReachedEnd) return;

    const result = await loadTracks(search, PAGE_SIZE, page + 1);
    if (!result.tracks?.length || result.tracks.length < PAGE_SIZE) setHasReachedEnd(true);
  };

  useEffect(() => {
    initialLoad();

    return () => {
      setTracks([]);
    };
  }, [client]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-shrink pt-44 pb-12 items-center justify-center w-full">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <Text>Home Page</Text>
        <TextInput
          className="bg-white w-2/3 my-4 color-black placeholder:color-gray-600"
          autoCapitalize="none"
          autoCorrect={false}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View className="flex-auto w-full mb-20">
        {!tracks.length && (
          <View className="w-full flex-1 flex justify-center items-center">
            <Text className="font-bold color-white">
              {!isInitialLoad && !isLoadingTracks && tracks.length == 0
                ? 'No results found'
                : 'Loading tracks...'}
            </Text>
          </View>
        )}
        {tracks.length > 0 && (
          <FlashList
            contentContainerClassName="py-2"
            keyExtractor={(item) => {
              return item.id;
            }}
            data={tracks}
            renderItem={({ item }) => <TrackEntry track={item} />}
            ListFooterComponent={() => (
              <View className="flex items-center justify-center py-2">
                {isLoadingTracks && (
                  <Text className="color-blue-200 font-medium text-lg">Loading...</Text>
                )}
                {hasReachedEnd && (
                  <Text className="color-blue-200 font-medium text-lg">End of results</Text>
                )}
              </View>
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
          />
        )}
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
