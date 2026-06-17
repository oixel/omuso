import { View, Text, Button, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { FlashList } from '@shopify/flash-list';
import { SearchResult, Track } from '@choral/types';
import { useEffect, useState } from 'react';

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
      <Text className="color-white font-medium text-xl m-0 p-0">
        {track.title || 'Untitled Track'}
      </Text>
      <Text style={{ lineHeight: 18, fontSize: 15 }} className="color-blue-200">
        {track.artist || ''}
      </Text>
    </View>
  </TouchableOpacity>
);

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const client = useAuth((state) => state.client);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const PAGE_SIZE = 200;

  const loadTracks = async (trackCount: number, trackOffset: number): Promise<SearchResult> => {
    if (!client) return { success: false };

    const result = await client.search({
      artistCount: 0,
      albumCount: 0,
      trackCount,
      trackOffset: trackOffset * trackCount,
    });

    if (result?.tracks) {
      const newTracks = result.tracks; // Capture narrowed value to use in setTracks closure
      setTracks((prev) => [...prev, ...newTracks]);
    }

    console.log(tracks.length + (result.tracks?.length ?? 0));

    return result;
  };

  const handleEndReached = async () => {
    if (isLoadingTracks || hasReachedEnd) return;

    setIsLoadingTracks(true);

    const result = await loadTracks(PAGE_SIZE, page);
    if (!result.success) console.log('Connection error');
    if (!result.tracks?.length) console.log('No results found');
    else if (result.tracks.length < PAGE_SIZE) setHasReachedEnd(true);

    setPage((prev) => prev + 1);

    setIsLoadingTracks(false);
  };

  useEffect(() => {
    console.log('All tracks loaded...');
    loadTracks(PAGE_SIZE, 0);

    return () => {
      setTracks([]);
    };
  }, [client]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-1 items-center justify-center w-full">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <Text>Home Page</Text>
      </View>
      <View className="flex-1 w-full mb-20">
        {!tracks.length && (
          <View className="w-full h-full bg-white flex justify-center items-center">
            <Text className="font-bold">Loading tracks...</Text>
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
              <View>
                {isLoadingTracks && <Text>Loading...</Text>}
                {hasReachedEnd && <Text>End of results</Text>}
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
