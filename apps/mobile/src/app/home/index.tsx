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
import { SearchResult, Song } from '@choral/types';
import { memo, useEffect, useRef, useState } from 'react';
import TextTicker from 'react-native-text-ticker';
import { useQueue, usePlayback } from '@choral/domain';
import ReanimatedSwipeable, {
  SwipeableMethods,
  SwipeDirection,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

function LeftAction(progress: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    return { transform: [{ translateX: drag.value - 80 }] };
  });

  return (
    <Animated.View
      style={[styleAnimation, { width: 80, justifyContent: 'center', alignItems: 'center' }]}
    >
      <Text className="font-bold color-white">Play next</Text>
    </Animated.View>
  );
}

function RightAction(progress: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    return { transform: [{ translateX: drag.value + 80 }] };
  });

  return (
    <Animated.View
      style={[styleAnimation, { width: 80, justifyContent: 'center', alignItems: 'flex-start' }]}
    >
      <Text className="font-bold color-white">Add to end</Text>
    </Animated.View>
  );
}

interface SongEntryProps {
  song: Song;
  touchableProps?: TouchableOpacityProps;
}

const SongEntry: React.FC<SongEntryProps> = memo(
  ({ song, touchableProps }) => {
    const swipeableRef = useRef<SwipeableMethods>(null);

    const useTitleTicker = song.title.length > 35;
    const useArtistTicker = (song.artist?.length ?? 0) > 35;

    return (
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={2}
        overshootFriction={8}
        enableTrackpadTwoFingerGesture
        rightThreshold={30}
        renderRightActions={RightAction}
        renderLeftActions={LeftAction}
        onSwipeableWillOpen={(dir: SwipeDirection) => {
          if (dir === 'left') useQueue.getState().addToEnd([song]);
          else useQueue.getState().addNext([song]);

          swipeableRef.current?.close();
        }}
      >
        <TouchableOpacity
          className="p-3 flex flex-row justify-start items-center max-h-20 gap-3 min-w-full"
          onPress={() => {
            useQueue.getState().setQueue([song]);
            usePlayback.getState().play();
          }}
          {...touchableProps}
        >
          <Image
            style={{ height: '100%', aspectRatio: 1 }}
            source={{ uri: song.coverArtURL }}
            contentFit="cover"
            recyclingKey={song.id}
            cachePolicy="memory-disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          <View className="border-b border-blue-500 flex-1 h-full">
            {useTitleTicker ? (
              <TextTicker
                scrollSpeed={25}
                marqueeDelay={1500}
                repeatSpacer={30}
                easing={Easing.linear}
                animationType="scroll"
                className="color-white font-medium text-xl"
              >
                {song.title || 'Untitled Song'}
              </TextTicker>
            ) : (
              <Text className="color-white font-medium text-xl">
                {song.title || 'Untitled Song'}
              </Text>
            )}
            {useArtistTicker ? (
              <TextTicker
                scrollSpeed={25}
                marqueeDelay={1500}
                repeatSpacer={30}
                easing={Easing.linear}
                animationType="scroll"
                style={{ lineHeight: 18, fontSize: 15 }}
                className="color-blue-200"
              >
                {song.artist || 'Unknown Artist'}
              </TextTicker>
            ) : (
              <Text className="color-blue-200"> {song.artist || 'Unknown Artist'}</Text>
            )}
          </View>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  },
  (prev: SongEntryProps, next: SongEntryProps) => prev.song.id === next.song.id
);

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

  const handleEndReached = async () => {
    if (isInitialLoad || isLoadingSongs || hasReachedEnd) return;

    const result = await loadSongs(search, PAGE_SIZE, page + 1);
    if (!result.songs?.length || result.songs.length < PAGE_SIZE) setHasReachedEnd(true);
  };

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
          <FlashList
            contentContainerClassName="py-2"
            keyExtractor={(item) => {
              return item.id;
            }}
            drawDistance={150}
            data={songs}
            ListFooterComponent={() => (
              <View className="flex items-center justify-center py-2">
                {isLoadingSongs && (
                  <Text className="color-blue-200 font-medium text-lg">Loading...</Text>
                )}
                {hasReachedEnd && (
                  <Text className="color-blue-200 font-medium text-lg">End of results</Text>
                )}
              </View>
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => <SongEntry song={item} />}
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
