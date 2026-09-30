import { View, Text } from 'react-native';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Album, Artist, SearchPageLabelOptions, Song } from '@omuso/types';

import { SwipeableSongEntry } from '../Swipeables/SwipeableSongEntry';
import { isAlbum, isArtist, isSong, useAuth, useDebounce, useHistory } from '@omuso/domain';
import { useSyncAlbums, useSyncArtists, useSyncSongs } from '@utils';
import { AlbumEntry, ArtistEntry } from '../MediaEntries';
import { FlashList } from '@shopify/flash-list';

const PAGE_SIZE = 55;

type ResultItem =
  { type: 'artist'; data: Artist } | { type: 'album'; data: Album } | { type: 'song'; data: Song };

// Helper function to compare the relevance between results for sorting 'all' tab data
function getRelevance(text: string, query: string): number {
  if (!query) return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  if (t === q) return 100; // Text is exactly the query
  if (t.startsWith(q)) return 80;
  if (t.includes(` ${q}`)) return 60; // Query is another word in the text
  if (t.includes(q)) return 40; // Query is somewhere in the text
  return 0;
}

// Calculates highest relevance score for passed in Media element
function scoreMedia(item: ResultItem, query: string): number {
  if (item.type === 'artist') {
    const nameScore = getRelevance(item.data.name, query);
    return nameScore;
  }
  if (item.type === 'album') {
    const nameScore = getRelevance(item.data.name, query);
    const artistScore = getRelevance(item.data.artist ?? '', query);
    return Math.max(nameScore, artistScore * 0.9); // Direct album name beats artist metadata
  }
  if (item.type === 'song') {
    const titleScore = getRelevance(item.data.title, query);
    const albumScore = getRelevance(item.data.album ?? '', query);
    const artistScore = getRelevance(item.data.artist ?? '', query);
    return Math.max(titleScore, albumScore * 0.9, artistScore * 0.8); // Direct song title beats other metadata
  } else return 0;
}

interface SearchResultListProps {
  searchQuery: string;
  tab?: SearchPageLabelOptions;
  horizontal?: boolean;
}

export function SearchResultList({
  searchQuery = '',
  tab = 'all',
  horizontal = false,
}: SearchResultListProps) {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  const latestQuery = useRef('');
  const debouncedSearch = useDebounce(searchQuery, 300); // Restart countdown every time the search input is updated

  useSyncArtists(setArtists);
  useSyncAlbums(setAlbums);
  useSyncSongs(setSongs);

  const loadMedia = async (query: string) => {
    latestQuery.current = query;
    setIsLoading(true);

    let newArtists: Artist[] = [];
    let newAlbums: Album[] = [];
    let newSongs: Song[] = [];

    if (query.length !== 0) {
      const result = await client?.search({ query });
      newArtists = result?.artists ?? [];
      newAlbums = result?.albums ?? [];
      newSongs = result?.songs ?? [];
    } else {
      newArtists = history.filter((media) => isArtist(media));
      newAlbums = history.filter((media) => isAlbum(media));
      newSongs = history.filter((media) => isSong(media));
    }

    // Discard current result if a newer query exists
    if (latestQuery.current !== query) return;

    setArtists(newArtists);
    setAlbums(newAlbums);
    setSongs(newSongs);

    setIsLoading(false);
  };

  const history = useHistory((state) => state.history);
  const addToHistory = useHistory((state) => state.addToHistory);

  useEffect(() => {
    loadMedia(debouncedSearch);
  }, [debouncedSearch, history]);

  // Wrap artists in shared type
  const artistData: ResultItem[] = useMemo(
    () => artists.map((artist) => ({ type: 'artist', data: artist })),
    [artists]
  );

  // Wrap albums in shared type
  const albumData: ResultItem[] = useMemo(
    () => albums.map((album) => ({ type: 'album', data: album })),
    [albums]
  );

  // Wrap songs in shared type
  const songData: ResultItem[] = useMemo(
    () => songs.map((song) => ({ type: 'song', data: song })),
    [songs]
  );

  // Merge all Media data and get top PAGE_SIZE results sorted by relevance
  const allData: ResultItem[] = useMemo(() => {
    const merged: ResultItem[] = [...albumData, ...artistData, ...songData];

    if (!debouncedSearch) return merged;

    return merged
      .map((item) => ({ item, score: scoreMedia(item, debouncedSearch) }))
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, PAGE_SIZE);
  }, [artistData, albumData, songData, debouncedSearch]);

  // Cast history from Media[] to ResultItem[]
  const historyData: ResultItem[] = useMemo(() => {
    return history.map(
      (data) =>
        ({
          type: isArtist(data) ? 'artist' : isAlbum(data) ? 'album' : 'song',
          data,
        }) as ResultItem
    );
  }, [history]);

  const hasMedia =
    (tab === 'all' && allData.length > 0) ||
    (tab == 'artists' && artistData.length > 0) ||
    (tab === 'albums' && albumData.length > 0) ||
    (tab === 'songs' && songData.length > 0);

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(
    () => SwipeableSongEntry(false, false, true, true, true, (song) => addToHistory(song)),
    []
  );

  const keyExtractor = useCallback((item: ResultItem) => `${item.type}-${item.data.id}`, []);
  const getItemType = useCallback((item: ResultItem) => item.type, []);
  const renderItem = useCallback(
    ({ item }: { item: ResultItem }) =>
      item.type === 'artist' ? (
        <ArtistEntry
          item={item.data}
          pathRelativity="./"
          isBigEntry={false}
          onPress={(artist) => addToHistory(artist)}
        />
      ) : item.type === 'album' ? (
        <AlbumEntry
          item={item.data}
          pathRelativity="./"
          isBigEntry={false}
          onPress={(album) => addToHistory(album)}
        />
      ) : (
        <SongEntry item={item.data} isBigEntry={false} />
      ),
    [SongEntry]
  );

  // Update what data is rendered in result list based on current tab (or if viewing history)
  const listData =
    searchQuery.length === 0
      ? historyData
      : tab === 'all'
        ? allData
        : tab === 'artists'
          ? artistData
          : tab === 'albums'
            ? albumData
            : songData;

  return (
    <View className="flex-1 w-full pb-4">
      {!isLoading && !hasMedia && (
        <View className="w-full flex-1 flex justify-center items-center mt-12">
          <Text className="text-white font-bold">
            {isLoading
              ? 'Searching...'
              : searchQuery.length === 0
                ? history.length === 0 && 'No previous search history'
                : 'No results found'}
          </Text>
        </View>
      )}

      {/* Render all lists, but swap display status based on current tab */}
      <View style={{ flex: 1 }}>
        <FlashList
          key={tab}
          data={listData}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          renderItem={renderItem}
          horizontal={horizontal}
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </View>
    </View>
  );
}
