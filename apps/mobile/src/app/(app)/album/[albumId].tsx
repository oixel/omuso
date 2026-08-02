import { Song } from '@omuso/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, CoverArt } from '@components';
import { months, msToDuration, useAuth, useQueue } from '@omuso/domain';
import { useSyncSongs } from '@utils';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AlbumPage = () => {
  const { client } = useAuth();
  const { albumId } = useLocalSearchParams();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);

  // Instantly load album metadata from cache, and then fetch songs using ID
  const { data: album } = useQuery({
    queryKey: ['album', albumId],
    queryFn: async () => (await client!.getAlbum(albumId as string)).album,
    enabled: !!client, // Do not attempt to query for album if no client exists
  });

  useEffect(() => {
    setSongs(album?.songs ?? []);
  }, [album]);

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(() => SwipeableSongEntry(true, false, false), []);

  useSyncSongs(setSongs);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      className="bg-blue-400"
      style={{ overflow: 'scroll' }}
    >
      <Pressable
        onPress={router.back}
        style={{ marginLeft: 18, marginTop: 75, alignSelf: 'flex-start', borderRadius: 8 }}
        className="text-xl font-bold  p-2 bg-blue-500"
      >
        <Text className="font-bold text-white">{'< Go Back'}</Text>
      </Pressable>
      <View
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
        <Text style={{ width: '80%' }} className="text-2xl color-blue-100 font-medium text-center">
          {album?.artist ?? 'Unknown Artist'}
        </Text>
        <View style={{ paddingBottom: 18, width: '80%' }} className="flex-row justify-center">
          {album?.genres && (
            <Text
              onPress={() =>
                router.push({ pathname: '/genre/[genre]', params: { genre: album.genres![0] } })
              }
              className="text-lg color-blue-200 font-medium"
            >
              {album.genres[0] + (album?.year ? ' • ' : '')}
            </Text>
          )}
          {album?.year && <Text className="text-lg color-blue-200 font-medium">{album.year}</Text>}
        </View>
        <Pressable
          onPress={() => useQueue.getState().setQueue(songs)}
          style={{ borderRadius: 8, marginBottom: 10 }}
          className="text-xl font-bold py-2 px-5 bg-blue-500"
        >
          <Text className="font-bold text-white">Play</Text>
        </Pressable>
      </View>
      {songs.length ? (
        <>
          <View className="w-full pb-4">
            {songs.map((song, index) => (
              <Animated.View key={song.id} entering={FadeInDown.duration(300).delay(index * 40)}>
                <SongEntry item={song} horizontal={false} />
              </Animated.View>
            ))}
          </View>
          <View className="w-full px-8 pt-4 pb-12">
            <Text className="text-lg color-blue-200 font-medium">{album?.songCount} songs</Text>
            {album?.duration && (
              <Text className="text-lg color-blue-200 font-medium">
                {msToDuration(album.duration * 1000)}
              </Text>
            )}
            {album?.genres && (
              <View className="flex-row">
                {album.genres.slice(0, 3).map((genre, index) => (
                  <Text
                    key={genre}
                    onPress={() => router.push({ pathname: '/genre/[genre]', params: { genre } })}
                    className="text-lg color-blue-200 font-medium"
                  >
                    {genre}
                    {index !== album.genres!.length - 1 ? '; ' : ''}
                  </Text>
                ))}
              </View>
            )}
            {(album?.originalReleaseDate &&
              album.originalReleaseDate.month &&
              album.originalReleaseDate.day &&
              album.originalReleaseDate.year && (
                <Text className="text-lg color-blue-200 font-medium">
                  Released on {months[album.originalReleaseDate.month]}{' '}
                  {album.originalReleaseDate.day}, {album.originalReleaseDate.year}
                </Text>
              )) ||
              (album?.year && (
                <Text className="text-lg color-blue-200 font-medium">Released in {album.year}</Text>
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
          <Text className="font-bold color-white">Loading...</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AlbumPage;
