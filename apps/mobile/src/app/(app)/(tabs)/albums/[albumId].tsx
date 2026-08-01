import { Album, Song } from '@omuso/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, MediaList } from '@components';
import { useAuth, useQueue } from '@omuso/domain';
import { useSyncSongs } from '@utils';
import { useQuery } from '@tanstack/react-query';

const AlbumPage = () => {
  const { client } = useAuth();
  const { albumId } = useLocalSearchParams();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);

  const { data: album } = useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => (await client!.getAlbum(albumId as string)).album,
    enabled: !!client, // Do not attempt to query for album if no client exists
  });

  useEffect(() => {
    setSongs(album?.songs ?? []);
  }, [album]);

  useSyncSongs(setSongs);

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
        {album?.name ?? 'Unknown Artist'}
      </Text>
      <Pressable
        onPress={() => useQueue.getState().setQueue(songs)}
        style={{ borderRadius: 8, marginBottom: 10 }}
        className="text-xl font-bold py-2 px-5 bg-blue-500"
      >
        <Text className="font-bold text-white">Play</Text>
      </Pressable>
      <View className="flex-1 w-full pb-4">
        <MediaList data={songs} Entry={SwipeableSongEntry} horizontal={false} />
      </View>
    </View>
  );
};

export default AlbumPage;
