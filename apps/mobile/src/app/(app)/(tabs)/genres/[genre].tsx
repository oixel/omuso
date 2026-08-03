import { Song } from '@omuso/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, MediaList } from '@components';
import { useAuth, useQueue } from '@omuso/domain';
import { useSyncSongs } from '@utils';

const Genre = () => {
  const { genre } = useLocalSearchParams();
  const { client } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const router = useRouter();

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(() => SwipeableSongEntry(false, true, true), []);

  useSyncSongs(setSongs);

  useEffect(() => {
    if (!client) return;

    (async () => {
      const response = await client.getSongsByGenre({ genre: genre as string });
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
        style={{ marginLeft: 18, marginTop: 75, alignSelf: 'flex-start', borderRadius: 8 }}
        className="text-xl font-bold  p-2 bg-blue-500"
      >
        <Text className="font-bold text-white">{'< Go Back'}</Text>
      </Pressable>
      <Text style={{ paddingTop: 25, paddingBottom: 18 }} className="text-2xl text-white font-bold">
        {genre}
      </Text>
      <Pressable
        onPress={() => useQueue.getState().setQueue(songs)}
        style={{ borderRadius: 8, marginBottom: 10 }}
        className="text-xl font-bold py-2 px-5 bg-blue-500"
      >
        <Text className="font-bold text-white">Play</Text>
      </Pressable>
      <View className="flex-1 w-full pb-4">
        <MediaList data={songs} Entry={SongEntry} horizontal={false} />
      </View>
    </View>
  );
};

export default Genre;
