import { View, Text, FlatList } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Song } from '@omuso/types';

import { SwipeableSongEntry } from '../Swipeables/SwipeableSongEntry';
import { useAuth, useDebounce } from '@omuso/domain';
import { useSyncSongs } from '@utils';

const PAGE_SIZE = 55;

export function SearchResultList({ searchQuery = '', onlyStarred = false, horizontal = false }) {
  const { client } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  const latestQuery = useRef('');
  const debouncedSearch = useDebounce(searchQuery, 300); // Resetart countdown every time the search input is updated

  useSyncSongs(setSongs);

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(() => SwipeableSongEntry(false, false, true, true), []);

  const loadSongs = async (query: string, newPage: number): Promise<Song[]> => {
    latestQuery.current = query;
    setIsLoadingSongs(true);

    const result = await client?.search({
      query,
      artistCount: 0,
      albumCount: 0,
      songCount: PAGE_SIZE,
      songOffset: newPage * PAGE_SIZE,
    });
    const newSongs = result?.songs ?? [];

    // Discard current result if a newer query exists
    if (latestQuery.current !== query) return newSongs;

    setSongs((prev) => (newPage === 0 ? newSongs : [...prev, ...newSongs]));
    setIsLoadingSongs(false);

    return newSongs;
  };

  useEffect(() => {
    (async () => {
      await loadSongs(debouncedSearch, 0);
    })();
  }, [debouncedSearch, onlyStarred]);

  return (
    <View className="flex-1 w-full pb-4">
      {isLoadingSongs && (
        <View className="w-full flex-1 flex justify-start mt-12 items-center">
          <Text className="font-bold text-white">Searching...</Text>
        </View>
      )}
      {!isLoadingSongs && !songs.length && (
        <View className="w-full flex-1 flex justify-start mt-12 items-center">
          <Text className="font-bold text-white">No results found</Text>
        </View>
      )}
      {!isLoadingSongs && songs.length > 0 && (
        <FlatList
          data={songs}
          renderItem={({ item }) => <SongEntry item={item} horizontal={false} />}
          horizontal={horizontal}
        />
      )}
    </View>
  );
}
