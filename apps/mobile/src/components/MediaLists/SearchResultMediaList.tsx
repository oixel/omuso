import { View, Text } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Song } from '@omuso/types';

import { MediaList } from './MediaList';
import { SwipeableSongEntry } from '../Swipeables/SwipeableSongEntry';
import { useAuth, useDebounce } from '@omuso/domain';
import { syncSongs } from '@/src/utils/syncSongs';

const PAGE_SIZE = 200;

export function SearchResultMediaList({
  searchQuery = '',
  onlyStarred = false,
  horizontal = false,
}) {
  const { client } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const latestQuery = useRef('');
  const debouncedSearch = useDebounce(searchQuery, 300); // Resetart countdown every time the search input is updated

  syncSongs(setSongs);

  const loadSongs = async (query: string, newPage: number): Promise<Song[]> => {
    latestQuery.current = query;
    setPage(newPage);
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

    if (newSongs.length < PAGE_SIZE) setHasReachedEnd(true);

    return newSongs;
  };

  useEffect(() => {
    setPage(0);
    setHasReachedEnd(false);

    (async () => {
      await loadSongs(debouncedSearch, 0);
    })();
  }, [debouncedSearch, onlyStarred]);

  return (
    <View className="flex-1 w-full pb-4">
      {isLoadingSongs && page === 0 && (
        <View className="w-full flex-1 flex justify-start mt-12 items-center">
          <Text className="font-bold color-white">Searching...</Text>
        </View>
      )}
      {!isLoadingSongs && !songs.length && (
        <View className="w-full flex-1 flex justify-center items-center">
          <Text className="font-bold color-white">No results found</Text>
        </View>
      )}
      {!(isLoadingSongs && page === 0) && songs.length > 0 && (
        <MediaList
          data={songs}
          Entry={SwipeableSongEntry}
          horizontal={horizontal}
          footer={() => (
            <View className="flex items-center justify-center py-2">
              {isLoadingSongs && (
                <Text className="color-blue-200 font-medium text-lg">Loading...</Text>
              )}
              {hasReachedEnd && (
                <Text className="color-blue-200 font-medium text-lg">End of results</Text>
              )}
            </View>
          )}
          onEndReached={async () => {
            if (!hasReachedEnd) loadSongs(searchQuery, page + 1);
          }}
        />
      )}
    </View>
  );
}
