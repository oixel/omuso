import { View, Text, FlatList } from 'react-native';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Album, Song } from '@omuso/types';

import { SwipeableSongEntry } from '../Swipeables/SwipeableSongEntry';
import { useAuth, useDebounce } from '@omuso/domain';
import { useSyncSongs } from '@utils';
import { AlbumEntry } from '../MediaEntries';
import { LabelOptions } from '@/src/app/(app)/(tabs)/search';
import { FlashList } from '@shopify/flash-list';

const PAGE_SIZE = 55;

type ResultItem = { type: 'song'; data: Song } | { type: 'album'; data: Album };

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
  // if (item.type === 'artist') return 0;
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
  tab?: LabelOptions;
  onlyStarred?: boolean;
  horizontal?: boolean;
}

export function SearchResultList({
  searchQuery = '',
  tab = 'all',
  onlyStarred = false,
  horizontal = false,
}: SearchResultListProps) {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  const latestQuery = useRef('');
  const debouncedSearch = useDebounce(searchQuery, 300); // Resetart countdown every time the search input is updated

  useSyncSongs(setSongs);

  const loadMedia = async (query: string, newPage: number) => {
    latestQuery.current = query;
    setIsLoading(true);

    const result = await client?.search({
      query,
      artistCount: 0,
      albumCount: PAGE_SIZE,
      songCount: PAGE_SIZE,
      songOffset: newPage * PAGE_SIZE,
    });

    const newAlbums = result?.albums ?? [];
    const newSongs = result?.songs ?? [];

    // Discard current result if a newer query exists
    if (latestQuery.current !== query) return;

    setAlbums((prev) => (newPage === 0 ? newAlbums : [...prev, ...newAlbums]));
    setSongs((prev) => (newPage === 0 ? newSongs : [...prev, ...newSongs]));

    setIsLoading(false);

    return newSongs;
  };

  useEffect(() => {
    loadMedia(debouncedSearch, 0);
  }, [debouncedSearch, onlyStarred]);

  // Wrap songs in shared type
  const songData: ResultItem[] = useMemo(
    () => songs.map((song) => ({ type: 'song', data: song })),
    [songs]
  );

  // Wrap albums in shared type
  const albumData: ResultItem[] = useMemo(
    () => albums.map((album) => ({ type: 'album', data: album })),
    [albums]
  );

  // Merge all Media data and get top PAGE_SIZE results sorted by relevance
  const allData: ResultItem[] = useMemo(() => {
    const merged: ResultItem[] = [...songData, ...albumData];

    if (!debouncedSearch) return merged;

    return merged
      .map((item) => ({ item, score: scoreMedia(item, debouncedSearch) }))
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, PAGE_SIZE);
  }, [albumData, songData, debouncedSearch]);

  const hasMedia =
    (tab === 'all' && allData.length > 9) ||
    (tab === 'songs' && songData.length > 0) ||
    (tab === 'albums' && albumData.length > 0);

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(() => SwipeableSongEntry(false, false, true, true, true), []);

  const keyExtractor = useCallback((item: ResultItem) => `${item.type}-${item.data.id}`, []);
  const getItemType = useCallback((item: ResultItem) => item.type, []);
  const renderItem = useCallback(
    ({ item }: { item: ResultItem }) =>
      item.type === 'song' ? (
        <SongEntry item={item.data} isBigEntry={false} />
      ) : (
        <AlbumEntry item={item.data} isBigEntry={false} />
      ),
    [SongEntry]
  );

  return (
    <View className="flex-1 w-full pb-4">
      {isLoading && (
        <View className="w-full flex-1 flex justify-start mt-12 items-center">
          <Text className="font-bold text-white">Searching...</Text>
        </View>
      )}
      {!isLoading && !hasMedia && (
        <View className="w-full flex-1 flex justify-start mt-12 items-center">
          <Text className="font-bold text-white">No results found</Text>
        </View>
      )}
      {/* Render all lists, but swap display status based on current tab */}
      <View style={{ flex: 1, display: !isLoading && tab === 'all' ? 'flex' : 'none' }}>
        <FlashList
          data={allData}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          renderItem={renderItem}
          horizontal={horizontal}
        />
      </View>
      <View style={{ flex: 1, display: !isLoading && tab === 'songs' ? 'flex' : 'none' }}>
        <FlashList
          data={songData}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          renderItem={renderItem}
          horizontal={horizontal}
        />
      </View>
      <View style={{ flex: 1, display: !isLoading && tab === 'albums' ? 'flex' : 'none' }}>
        <FlashList
          data={albumData}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          renderItem={renderItem}
          horizontal={horizontal}
        />
      </View>
    </View>
  );
}
