import { Song } from '@omuso/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, MediaList } from '@components';
import { useAuth } from '@omuso/domain';
import { syncSongs } from '@utils';

const Genre = () => {
  const { genre } = useLocalSearchParams();
  const { client } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const router = useRouter();

  syncSongs(setSongs);

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
        style={{ paddingLeft: 18, marginTop: 75, alignSelf: 'flex-start' }}
        className="text-xl text-white font-bold"
      >
        <Text>{'< Go Back'}</Text>
      </Pressable>
      <Text style={{ paddingTop: 25, paddingBottom: 25 }} className="text-2xl text-white font-bold">
        {genre}
      </Text>
      <View className="flex-1 w-full pb-4">
        <MediaList data={songs} Entry={SwipeableSongEntry} horizontal={false} />
      </View>
    </View>
  );
};

export default Genre;
