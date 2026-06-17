import { View, Text, Button, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { FlashList } from '@shopify/flash-list';
import { Track } from '@choral/types';
import { useEffect, useState } from 'react';

interface TrackEntryProps {
  track: Track;
  touchableProps?: TouchableOpacityProps;
}

const TrackEntry: React.FC<TrackEntryProps> = ({ track, touchableProps }) => (
  <TouchableOpacity className="bg-blue-300 color-black font-bold p-3" {...touchableProps}>
    <Text>{track.title || 'Untitled Track'}</Text>
  </TouchableOpacity>
);

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const client = useAuth((state) => state.client);

  const [tracks, setTracks] = useState<Track[]>([]);

  const loadAllTracks = async () => {
    if (!client) return;
    const result = await client.search({
      artistCount: 0,
      albumCount: 0,
      trackCount: 20,
    });

    if (result?.tracks) setTracks(result?.tracks);
  };

  useEffect(() => {
    console.log('All tracks loaded...');
    loadAllTracks();

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
      <View className="flex-1 w-3/4 mb-20">
        {!tracks && (
          <View className="w-full h-full bg-white flex justify-center items-center">
            <Text className="font-bold">Loading tracks...</Text>
          </View>
        )}
        {tracks && (
          <FlashList
            className="bg-white p-4"
            keyExtractor={(item) => {
              return item.id;
            }}
            data={tracks}
            renderItem={({ item }) => <TrackEntry track={item} />}
            ItemSeparatorComponent={() => <View className="my-2" />}
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
