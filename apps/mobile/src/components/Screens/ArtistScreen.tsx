import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isArtist, useAuth, useUpdatedMedia } from '@omuso/domain';
import { useEffect, useMemo, useState } from 'react';
import { Album, Artist, Song } from '@omuso/types';
import { AlbumEntry, CoverArt, SwipeableSongEntry } from '@components';
import { useSyncAlbums, useSyncSongs } from '@utils';
import { ScrollView, Pressable, Text, View, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Play, Star } from 'lucide-react-native';

export default function ArtistScreen() {
  const { client } = useAuth();
  const queryClient = useQueryClient();
  const { artistId } = useLocalSearchParams();
  const [loaded, setLoaded] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [starred, setStarred] = useState(false);

  const [bioExpanded, setBioExpanded] = useState(false);

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
      if (result.artist.albums)
        setAlbums(
          result.artist.albums.sort(
            (a, b) => (b.originalReleaseDate?.year ?? 0) - (a.originalReleaseDate?.year ?? 0)
          )
        );

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
  useSyncAlbums(setAlbums);

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
          <Animated.View
            entering={FadeInDown.duration(200).delay(60)}
            className="flex-row gap-2 mb-4"
          >
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
                setStarred((prev) => !prev); // Toggle star excitedly
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
          </Animated.View>
          {albums && (
            <View style={{ height: 290, width: '95%', paddingBottom: 24 }}>
              <Text className="font-bold text-white text-2xl">Albums</Text>
              <FlatList
                style={{ flex: 1 }}
                horizontal={true}
                data={albums}
                keyExtractor={(item) => {
                  return item.id + item.starred;
                }}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <AlbumEntry
                    item={item}
                    pathRelativity="../../"
                    isBigEntry={true}
                    showArtistName={false}
                    showYear={true}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 24 }}
              />
            </View>
          )}
          {artist.biography && (
            <Animated.View entering={FadeInDown.duration(200).delay(100)} className="w-[95%] pb-12">
              <Text className="font-bold text-white text-2xl pb-2">Biography</Text>
              <Text numberOfLines={bioExpanded ? undefined : 3} className="font-bold text-blue-100">
                {artist.biography}
              </Text>
              <Pressable
                onPress={() => setBioExpanded((prev) => !prev)}
                accessibilityRole="button"
                accessibilityState={{ expanded: bioExpanded }}
              >
                <Text className="font-bold text-blue-200">
                  {bioExpanded ? 'Show less' : 'Read more'}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
