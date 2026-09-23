import { Song } from '@omuso/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, MediaList } from '@components';
import { useAuth, useQueue } from '@omuso/domain';
import { useSyncSongs } from '@utils';
import { Play } from 'lucide-react-native';

export default function GenreScreen() {
  const { genreId } = useLocalSearchParams();
  const { client } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const router = useRouter();

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(() => SwipeableSongEntry(true, false, true, false, true), []);

  useSyncSongs(setSongs);

  useEffect(() => {
    if (!client) return;

    (async () => {
      const response = await client.getSongsByGenre({ genre: genreId as string });
      if (response.success) setSongs(response.songs ?? []);
    })();

    return () => {
      setSongs([]);
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <Pressable
        onPress={router.back}
        style={{
          marginLeft: 18,
          marginTop: 75,
          alignSelf: 'flex-start',
          borderRadius: 8,
          backgroundColor: '#5186dc',
        }}
        className="text-xl font-bold p-2 "
      >
        <Text className="font-bold text-white">{'< Go Back'}</Text>
      </Pressable>
      <Text style={{ paddingTop: 25, paddingBottom: 18 }} className="text-2xl text-white font-bold">
        {genreId}
      </Text>
      <Pressable
        onPress={() => useQueue.getState().setQueue(songs)}
        style={{ borderRadius: 24, marginBottom: 10, backgroundColor: '#5186dc' }}
        className="text-xl font-bold py-2 px-8 flex-row gap-4 justify-center items-center"
      >
        <Play color="white" fill="white" size={20} />
        <Text className="font-medium text-white text-lg">Play</Text>
      </Pressable>
      <View className="flex-1 w-full pb-4">
        <MediaList data={songs} Entry={SongEntry} horizontal={false} />
      </View>
    </View>
  );
}
