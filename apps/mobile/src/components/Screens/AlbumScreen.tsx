import { Album, Media, Song } from '@omuso/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { SwipeableSongEntry, CoverArt, AlbumEntry, MediaNameLink } from '@components';
import {
  isAlbum,
  months,
  msToDuration,
  useAuth,
  useQueue,
  useTheme,
  useUpdatedMedia,
} from '@omuso/domain';
import { useSyncSongs } from '@utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { ChevronLeft, Play, Shuffle, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { extractColors } from '@utils/extractColors';
import { getTextColor } from '@utils/contrast';
import { Image } from 'expo-image';

const BAR_CONTENT_HEIGHT = 48; // How tall the dynamic album name top bar should be

// Use SwipeableSongEntry factory
const SongEntry = SwipeableSongEntry(true, true, false, false, false);

const DEFAULT_COLORS = { primary: '#5186dc', secondary: '#60a5fa' };

export default function AlbumScreen() {
  const { client } = useAuth();
  const queryClient = useQueryClient();
  const { albumId: rawId } = useLocalSearchParams<{ albumId: string | string[] }>();
  const albumId = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [starred, setStarred] = useState(false);
  const setQueue = useQueue((state) => state.setQueue);

  // Undo dynamic tab bar colors on focus loss
  const resetTabColors = useTheme((s) => s.reset);
  useFocusEffect(useCallback(() => () => resetTabColors(), [resetTabColors]));

  // Instantly load album metadata from cache, and then fetch songs using ID
  const { data: album } = useQuery({
    queryKey: ['album', albumId],
    queryFn: async (): Promise<Album> => {
      const result = await client!.getAlbum(albumId);

      if (!result.album) {
        throw new Error(`Album not found: ${albumId}`);
      }

      return result.album;
    },
    enabled: !!client, // Do not attempt to query for album if no client exists
  });

  // Fetch artist to access list of other albums created by them
  const { data: artist } = useQuery({
    queryKey: ['artist', album?.artistId],
    queryFn: async () => (await client!.getArtist(album!.artistId!)).artist,
    enabled: !!client && !!album?.artistId,
  });

  useEffect(() => {
    setSongs(album?.songs ?? []);
    setStarred(!!album?.starred);
  }, [album]);

  const coverArtURL = useMemo(() => album?.coverArtURL, [album?.id]);

  const [imageDisplayed, setImageDisplayed] = useState(false);
  useEffect(() => setImageDisplayed(false), [albumId]);
  const imageReady = !coverArtURL || imageDisplayed;
  const handleDisplay = useCallback(() => setImageDisplayed(true), []);

  const { data: extracted, isError: colorsFailed } = useQuery({
    queryKey: ['albumColors', albumId],
    queryFn: () => extractColors(coverArtURL!),
    enabled: !!coverArtURL,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  const colors = extracted ?? DEFAULT_COLORS;
  const colorsReady = !!album && (!coverArtURL || !!extracted || colorsFailed);

  const ready = colorsReady && imageReady;

  const theme = useMemo(() => {
    const onPrimary = getTextColor(colors.primary);
    const onSecondary = getTextColor(colors.secondary);
    const muted = onPrimary === '#000000' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.7)';
    return { onPrimary, onSecondary, muted };
  }, [colors.primary, colors.secondary]);

  // Update tab bar colors to match dynamic background when focused on album page
  const setTabColors = useTheme((s) => s.setTabColors);
  useFocusEffect(
    useCallback(() => {
      if (!colorsReady) return;
      setTabColors({
        background: colors.primary,
        foreground: theme.onPrimary,
        inactive: theme.muted,
      });
    }, [colorsReady, colors.primary, theme.onPrimary, theme.muted, setTabColors])
  );

  useSyncSongs(setSongs);

  // Independently track whether album has been updated
  const updatedMedia = useUpdatedMedia(client);

  useEffect(() => {
    // If this page's album has been updated, update its data in the query cache to reflect the changes
    // On exact key match, react-query notifies subscribers which forces a re-render
    if (!updatedMedia || !isAlbum(updatedMedia) || updatedMedia.id !== albumId) return;
    queryClient.setQueryData(['album', albumId], updatedMedia);
  }, [updatedMedia, albumId, queryClient]);

  /*
      Animation properties
  */

  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const COVER_HEIGHT = height * 0.5;
  const HEADER_HEIGHT = insets.top + BAR_CONTENT_HEIGHT;

  const scrollY = useSharedValue(0);

  const titleHeight = useSharedValue(40);
  const overlayHeight = useSharedValue(100);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Trigger point for hidden top bar
  const end = useDerivedValue(
    () => COVER_HEIGHT - overlayHeight.value + titleHeight.value - 8 - HEADER_HEIGHT
  );

  const topBarBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [end.value, end.value + 16], [0, 1], Extrapolation.CLAMP),
    };
  });

  const topBarTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [end.value, end.value + 16], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [end.value, end.value + 16],
            [8, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const footerGenres = album?.genres?.slice(0, 3) ?? [];
  const primaryGenre = album?.genres?.[0];

  const moreAlbums = useMemo(
    () => artist?.albums?.filter((a) => a.id !== album?.id) ?? [],
    [artist?.albums, album?.id]
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
        style={{ backgroundColor: colors.primary }}
      >
        {album && (
          <Animated.View
            className="w-full items-center"
            style={{ height: COVER_HEIGHT, opacity: ready ? 1 : 0 }}
          >
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.secondary }]}>
              <CoverArt
                uri={coverArtURL}
                recyclingKey={album.id}
                style={{ width: '100%', height: '100%' }}
                placeholder={null}
                priority="high"
                onDisplay={handleDisplay}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', colors.primary]}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%' }}
              />
            </Animated.View>
            <View
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
              className="flex flex-row px-5 pb-6 justify-between"
            >
              {/* Left side album detail text */}
              <View style={{ maxWidth: '50%' }}>
                <Text
                  style={{ paddingTop: 18, color: theme.onPrimary }}
                  className="text-2xl font-bold"
                >
                  {album.name ?? 'Unknown Album'}
                </Text>
                {/* Access artist page by clicking their name */}
                <MediaNameLink
                  queryClient={queryClient}
                  queryKey="artist"
                  pathname="../../artist"
                  media={artist}
                  label={album.artist ?? artist?.name ?? 'Unknown artist'}
                  color={theme.muted}
                />
                <View className="flex flex-row">
                  {!!primaryGenre && (
                    <MediaNameLink
                      pathname="../../genre"
                      // Use genre as ID to route to use it as key for routing
                      media={{ id: primaryGenre } as Media}
                      label={primaryGenre + (album.year ? ' • ' : '')}
                      color={theme.muted}
                    />
                  )}
                  {!!album.year && (
                    <Text style={{ color: theme.muted }} className="text-lg font-medium">
                      {album.year}
                    </Text>
                  )}
                </View>
              </View>

              {/* Right side interaction buttons */}
              <View className="flex flex-row gap-2 items-end">
                <Pressable
                  onPress={() => setQueue(songs)}
                  style={{ backgroundColor: colors.secondary, borderRadius: 24 }}
                  className="aspect-square w-14 flex items-center justify-center"
                >
                  <Play color={theme.onSecondary} fill={theme.onSecondary} size={20} />
                </Pressable>
                <Pressable
                  onPress={() => setQueue([...songs].sort(() => Math.random() - 0.5))} // TODO: Make a proper shuffle rather than randomize
                  style={{ backgroundColor: colors.secondary, borderRadius: 24 }}
                  className="aspect-square w-14 flex items-center justify-center"
                >
                  <Shuffle color={theme.onSecondary} size={20} />
                </Pressable>
                <Pressable
                  disabled={!album}
                  onPress={async () => {
                    if (!client || !album) return;
                    const prev = starred;
                    setStarred(!prev); // Toggle star excitedly
                    try {
                      const res = await client.toggleStarred(album, prev);
                      setStarred(!!res.starred);
                      queryClient.invalidateQueries({ queryKey: ['artist', album.artistId] }); // Trigger re-render where album is visible
                    } catch {
                      setStarred(prev);
                    }
                  }}
                  style={{
                    opacity: !album ? 0.5 : 1,
                    borderRadius: 24,
                    backgroundColor: colors.secondary,
                  }}
                  className="aspect-square w-14 flex items-center justify-center"
                >
                  <Star
                    color={theme.onSecondary}
                    fill={starred ? theme.onSecondary : 'none'}
                    size={20}
                  />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
        {songs.length > 0 && colorsReady ? (
          <>
            <View className="w-full pb-4">
              {songs.map((song, index) => (
                <Animated.View
                  key={song.id}
                  entering={FadeInDown.duration(300).delay(Math.min(index, 10) * 40)} // Only plays for first 10 tracks
                >
                  <SongEntry
                    item={song}
                    isBigEntry={false}
                    primaryColor={colors.primary}
                    onPrimary={theme.onPrimary}
                    secondaryColor={colors.secondary}
                    onSecondary={theme.onSecondary}
                  />
                </Animated.View>
              ))}
            </View>
            <View className="w-full px-8 pt-4 pb-12">
              <Text style={{ color: theme.muted }} className="text-lg  font-medium">
                {album?.songCount} songs
              </Text>
              {!!album?.duration && (
                <Text style={{ color: theme.muted }} className="text-lg  font-medium">
                  {msToDuration(album.duration * 1000)}
                </Text>
              )}
              {footerGenres.length > 0 && (
                <View className="flex-row">
                  {footerGenres.map((genre, index) => (
                    <MediaNameLink
                      key={genre}
                      pathname="../../genre"
                      media={{ id: genre } as Media}
                      label={genre + (index < footerGenres.length - 1 ? '; ' : '')}
                      color={theme.muted}
                    />
                  ))}
                </View>
              )}
              {(album?.originalReleaseDate &&
                !!album.originalReleaseDate.month &&
                !!album.originalReleaseDate.day &&
                !!album.originalReleaseDate.year && (
                  <Text style={{ color: theme.muted }} className="text-lg font-medium">
                    Released on {months[album.originalReleaseDate.month]}{' '}
                    {album.originalReleaseDate.day}, {album.originalReleaseDate.year}
                  </Text>
                )) ||
                (!!album?.year && (
                  <Text style={{ color: theme.muted }} className="text-lg font-medium">
                    Released in {album.year}
                  </Text>
                ))}

              {album && artist?.albums && (
                <View className="pt-8">
                  <Text style={{ color: theme.onPrimary }} className="text-xl font-bold">
                    More by {artist.name}
                  </Text>
                  <FlatList
                    style={{ flex: 1 }}
                    horizontal={true}
                    data={moreAlbums}
                    keyExtractor={(item) => item.id}
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
            </View>
          </>
        ) : (
          <View className="w-full flex-1 flex justify-start mt-12 items-center">
            <Text style={{ color: theme.onPrimary }} className="font-bold">
              Loading...
            </Text>
          </View>
        )}
      </Animated.ScrollView>
      {/* Fixed top bar (back button and dynamic title) */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          paddingTop: insets.top,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Dynamic background (visibility changes with scroll) */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.primary,
              borderBottomWidth: 1,
              borderBottomColor: theme.onPrimary,
            },
            topBarBackgroundStyle,
          ]}
        />

        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft color={theme.onSecondary} size={22} />
        </Pressable>

        <Animated.Text
          numberOfLines={1}
          style={[
            {
              position: 'absolute',
              left: 64,
              right: 64,
              top: insets.top,
              lineHeight: BAR_CONTENT_HEIGHT,
              textAlign: 'center',
              color: theme.onPrimary,
              fontWeight: 'bold',
              fontSize: 17,
            },
            topBarTitleStyle,
          ]}
        >
          {album?.name}
        </Animated.Text>
      </View>
    </View>
  );
}
