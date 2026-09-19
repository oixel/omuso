import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isArtist, useAuth, useUpdatedMedia } from '@omuso/domain';
import { useEffect, useMemo, useState } from 'react';
import { Album, Artist, Song } from '@omuso/types';
import { CoverArt, SwipeableSongEntry } from '@components';
import { useSyncSongs } from '@utils';
import { ScrollView, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Play, Shuffle, Star } from 'lucide-react-native';

const ArtistPage = () => {
  const { client } = useAuth();
  const queryClient = useQueryClient();
  const { artistId } = useLocalSearchParams();
  const [loaded, setLoaded] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);
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

      const artistInfo = await client?.getArtistInfo(artistId as string);

      setLoaded(true);

      return { ...result.artist, ...artistInfo } as Artist;
    },
    enabled: !!client, // Only attempt to query for artist if a client exists
  });

  useEffect(() => {
    if (!artist) return;

    setSongs([]);
    setStarred(!!artist.starred);
  }, [artist?.id, client]);

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
        className="text-xl font-bold p-2 mb-6"
      >
        <Text className="font-bold text-white">{'< Go Back'}</Text>
      </Pressable>
      {artist && loaded && (
        <View
          style={{
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Animated.View entering={FadeInDown.duration(200)}>
            <CoverArt
              style={{ width: '95%', aspectRatio: 1, borderRadius: 8 }}
              uri={artist.coverArtURL}
              recyclingKey={artist?.id}
            />
          </Animated.View>
          <View className="w-[95%] mb-4">
            <Animated.View
              entering={FadeInDown.duration(200).delay(50)}
              className="flex max-w-full gap-2 items-center justify-center"
            >
              <Text
                style={{ paddingTop: 18, paddingBottom: 8 }}
                className="text-2xl text-white font-bold "
              >
                {artist?.name ?? 'Unknown Artist'}
              </Text>
            </Animated.View>

            {artist.biography && (
              <Animated.View entering={FadeInDown.duration(200).delay(100)}>
                <Text numberOfLines={3} className="font-bold text-blue-100">
                  {artist.biography}
                </Text>
              </Animated.View>
            )}
          </View>
          <View className="flex-row gap-2 mb-4">
            <Pressable
              // onPress={() => useQueue.getState().setQueue(songs)}
              style={{ borderRadius: 24, marginBottom: 10, backgroundColor: '#5186dc' }}
              className="text-xl font-bold py-2 px-8 flex-row gap-4 justify-center items-center"
            >
              <Play color="white" fill="white" size={20} />
              <Text className="font-medium text-white text-lg">Play</Text>
            </Pressable>
            <Pressable
              disabled={!artist}
              onPress={async () => {
                setStarred(!starred); // Toggle star excitedly
                const newStatus = (await client?.toggleStarred(artist, starred))?.starred;
                setStarred(!!newStatus);
              }}
              style={{
                opacity: !artist ? 0.5 : 1,
                borderRadius: 24,
                marginBottom: 10,
                backgroundColor: '#5186dc',
              }}
              className="py-2 px-4 flex-row justify-center items-center"
            >
              <Star color="white" fill={starred ? 'white' : 'none'} size={20} />
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ArtistPage;
