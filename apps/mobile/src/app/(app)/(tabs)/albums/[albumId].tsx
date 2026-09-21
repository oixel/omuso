import { Song } from '@omuso/types';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, CoverArt } from '@components';
import { isAlbum, months, msToDuration, useAuth, useQueue, useUpdatedMedia } from '@omuso/domain';
import { useSyncSongs } from '@utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Play, Shuffle, Star } from 'lucide-react-native';

const AlbumPage = () => {
  const { client } = useAuth();
  const queryClient = useQueryClient();
  const { albumId } = useLocalSearchParams();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [starred, setStarred] = useState(false);

  // Instantly load album metadata from cache, and then fetch songs using ID
  const { data: album } = useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => (await client!.getAlbum(albumId as string)).album,
    enabled: !!client, // Do not attempt to query for album if no client exists
  });

  useEffect(() => {
    setSongs(album?.songs ?? []);
    setStarred(!!album?.starred);
  }, [album]);

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(() => SwipeableSongEntry(true, true, false, false, false), []);

  useSyncSongs(setSongs);

  // Independently track whether album has been updated
  const updatedMedia = useUpdatedMedia(client);

  useEffect(() => {
    // If this page's album has been updated, update its data in the query cache to reflect the changes
    // On exact key match, react-query notifies subscribers which forces a re-render
    if (!updatedMedia || !isAlbum(updatedMedia) || updatedMedia.id !== albumId) return;
    queryClient.setQueryData(['album', albumId], updatedMedia);
  }, [updatedMedia, albumId, queryClient]);

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
      {album && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={{
            alignItems: 'center',
            width: '95%',
          }}
        >
          <CoverArt
            style={{ marginTop: 24, width: '80%', aspectRatio: 1, borderRadius: 8 }}
            uri={album?.coverArtURL}
            recyclingKey={album?.id}
          />
          <Text style={{ paddingTop: 18 }} className="text-2xl text-white font-bold">
            {album?.name ?? 'Unknown Album'}
          </Text>
          <Text style={{ width: '80%' }} className="text-2xl text-blue-100 font-medium text-center">
            {album?.artist ?? 'Unknown Artist'}
          </Text>
          <View style={{ paddingBottom: 18, width: '80%' }} className="flex-row justify-center">
            {album?.genres && (
              <Link
                href={{ pathname: '/genres/[genre]', params: { genre: album.genres![0] } }}
                withAnchor
                asChild
              >
                <Pressable
                  onPress={(e) => {
                    if (!album.genres?.length) e.preventDefault();
                  }}
                >
                  <Text className="text-lg text-blue-200 font-medium">
                    {album.genres[0] + (album?.year ? ' • ' : '')}
                  </Text>
                </Pressable>
              </Link>
            )}
            {album?.year && <Text className="text-lg text-blue-200 font-medium">{album.year}</Text>}
          </View>
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() =>
                useQueue.getState().setQueue([...songs].sort(() => Math.random() - 0.5))
              } // TODO: Make a proper shuffle rather than randomize
              style={{ borderRadius: 24, marginBottom: 10, backgroundColor: '#5186dc' }}
              className="text-xl font-bold py-2 px-4 flex-row gap-4 justify-center items-center"
            >
              <Shuffle color="white" size={20} />
            </Pressable>
            <Pressable
              onPress={() => useQueue.getState().setQueue(songs)}
              style={{ borderRadius: 24, marginBottom: 10, backgroundColor: '#5186dc' }}
              className="text-xl font-bold py-2 px-8 flex-row gap-4 justify-center items-center"
            >
              <Play color="white" fill="white" size={20} />
              <Text className="font-medium text-white text-lg">Play</Text>
            </Pressable>
            <Pressable
              disabled={!album}
              onPress={async () => {
                setStarred((prev) => !prev); // Toggle star excitedly
                const newStatus = (await client?.toggleStarred(album, starred))?.starred;
                setStarred(!!newStatus);
              }}
              style={{
                opacity: !album ? 0.5 : 1,
                borderRadius: 24,
                marginBottom: 10,
                backgroundColor: '#5186dc',
              }}
              className="py-2 px-4 flex-row justify-center items-center"
            >
              <Star color="white" fill={starred ? 'white' : 'none'} size={20} />
            </Pressable>
          </View>
        </Animated.View>
      )}
      {songs.length ? (
        <>
          <View className="w-full pb-4">
            {songs.map((song, index) => (
              <Animated.View key={song.id} entering={FadeInDown.duration(300).delay(index * 40)}>
                <SongEntry item={song} isBigEntry={false} />
              </Animated.View>
            ))}
          </View>
          <View className="w-full px-8 pt-4 pb-12">
            <Text className="text-lg text-blue-200 font-medium">{album?.songCount} songs</Text>
            {album?.duration && (
              <Text className="text-lg text-blue-200 font-medium">
                {msToDuration(album.duration * 1000)}
              </Text>
            )}
            {album?.genres && (
              <View className="flex-row">
                {album.genres.slice(0, 3).map((genre, index) => (
                  <Link
                    key={genre}
                    href={{ pathname: '/genres/[genre]', params: { genre: genre } }}
                    withAnchor
                    asChild
                  >
                    <Text key={genre} className="text-lg text-blue-200 font-medium">
                      {genre}
                      {index !== album.genres!.length - 1 ? '; ' : ''}
                    </Text>
                  </Link>
                ))}
              </View>
            )}
            {(album?.originalReleaseDate &&
              album.originalReleaseDate.month &&
              album.originalReleaseDate.day &&
              album.originalReleaseDate.year && (
                <Text className="text-lg text-blue-200 font-medium">
                  Released on {months[album.originalReleaseDate.month]}{' '}
                  {album.originalReleaseDate.day}, {album.originalReleaseDate.year}
                </Text>
              )) ||
              (album?.year && (
                <Text className="text-lg text-blue-200 font-medium">Released in {album.year}</Text>
              ))}
            <View className="pt-8">
              <Text className="text-xl text-white font-bold">
                More by {album?.artist ?? 'Unknown artist'}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View className="w-full flex-1 flex justify-start mt-12 items-center">
          <Text className="font-bold text-white">Loading...</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AlbumPage;
