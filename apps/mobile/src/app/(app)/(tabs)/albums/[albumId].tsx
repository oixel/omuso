import { Album, Song } from '@omuso/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, MediaList } from '@components';
import { useAuth } from '@omuso/domain';
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
        style={{ paddingLeft: 18, marginTop: 75, alignSelf: 'flex-start' }}
        className="text-xl text-white font-bold"
      >
        <Text>{'< Go Back'}</Text>
      </Pressable>
      <Text style={{ paddingTop: 25, paddingBottom: 25 }} className="text-2xl text-white font-bold">
        {album?.name ?? 'Unknown Artist'}
      </Text>
      <View className="flex-1 w-full pb-4">
        <MediaList data={songs} Entry={SwipeableSongEntry} horizontal={false} />
      </View>
    </View>
  );
};

export default AlbumPage;
