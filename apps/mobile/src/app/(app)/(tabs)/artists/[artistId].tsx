import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getArtistImage, isArtist, useAuth, useUpdatedMedia } from '@omuso/domain';
import { useEffect, useMemo, useState } from 'react';
import { Artist, Song } from '@omuso/types';
import { CoverArt, SwipeableSongEntry } from '@components';
import { useSyncSongs } from '@utils';
import { ScrollView, Pressable, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ArtistPage = () => {
  const { client } = useAuth();
  const queryClient = useQueryClient();
  const { artistId } = useLocalSearchParams();
  const [songs, setSongs] = useState<Song[]>([]);
  const [starred, setStarred] = useState(false);

  const router = useRouter();

  // Load artist metadata from cache on render (if client is available)
  const { data: artist } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async (): Promise<Artist> => {
      const result = await client!.getArtist(artistId as string);

      if (!result.artist) {
        throw new Error(`Artist not found: ${artistId}`);
      }

      const imageURLs = await getArtistImage(result.artist);

      return { ...result.artist, artistImageURLs: imageURLs };
    },
    enabled: !!client, // Only attempt to query for artist if a client exists
  });

  useEffect(() => {
    setSongs([]);
    setStarred(!!artist?.starred);
  }, [artist]);

  const SongEntry = useMemo(() => SwipeableSongEntry(true, true, false, false, false), []);

  useSyncSongs(setSongs);

  const updatedMedia = useUpdatedMedia(client);

  useEffect(() => {
    if (!updatedMedia || !isArtist(updatedMedia) || updatedMedia.id === artistId) return;
    queryClient.setQueryData(['artist', artistId], updatedMedia);
  }, [updatedMedia, artistId, queryClient]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      className="bg-blue-400"
      style={{ overflow: 'scroll' }}
    >
      <Pressable
        onPress={router.back}
        style={{
          marginLeft: 18,
          marginTop: 75,
          alignSelf: 'flex-start',
          borderRadius: 8,
          backgroundColor: '#5186dc',
        }}
        className="text-xl font-bold  p-2"
      >
        <Text className="font-bold text-white">{'< Go Back'}</Text>
      </Pressable>
      {artist && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={{
            alignItems: 'center',
            width: '95%',
          }}
        >
          <CoverArt
            style={{ marginTop: 24, width: '100%', aspectRatio: 1, borderRadius: 8 }}
            uri={artist?.artistImageURLs?.xl}
            recyclingKey={artist?.id}
          />
          <Text style={{ paddingTop: 18 }} className="text-2xl text-white font-bold">
            {artist?.name ?? 'Unknown Artist'}
          </Text>
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default ArtistPage;
