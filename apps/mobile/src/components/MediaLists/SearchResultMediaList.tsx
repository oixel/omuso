import { View, Text } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@choral/domain';
import { Song } from '@choral/types';

import MediaList from './MediaList';
import SongEntry from '@components/MediaEntries/SongEntry';
import { search } from '@database';

const PAGE_SIZE = 200;

const SearchResultMediaList = ({ searchQuery = '', horizontal = false }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300); // Debounces every time search is updated
  const latestQuery = useRef('');

  const loadSongs = async (query: string, newPage: number): Promise<Song[]> => {
    latestQuery.current = query;
    setPage(newPage);
    setIsLoadingSongs(true);

    const result = await search(query, ['song'], PAGE_SIZE, newPage * PAGE_SIZE);
    const newSongs = result?.songs ?? [];

    // Discard current result if a newer query exists
    if (latestQuery.current !== query) return newSongs;

    setSongs((prev) => (newPage === 0 ? newSongs : [...prev, ...newSongs]));
    setIsLoadingSongs(false);

    if (newSongs.length < PAGE_SIZE) setHasReachedEnd(true);

    return newSongs;
  };

  useEffect(() => {
    let cancelled = false;

    setSongs([]);
    setPage(0);
    setHasReachedEnd(false);

    (async () => {
      await loadSongs(debouncedSearch, 0);
      if (!cancelled) setIsInitialLoad(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  return (
    <View className="flex-1 w-full pb-4">
      {!songs.length && (
        <View className="w-full flex-1 flex justify-center items-center">
          <Text className="font-bold color-white">
            {!isInitialLoad && !isLoadingSongs && songs.length == 0
              ? 'No results found'
              : 'Loading songs...'}
          </Text>
        </View>
      )}
      {songs.length > 0 && (
        <MediaList
          data={songs}
          Entry={SongEntry}
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
            if (isInitialLoad || isLoadingSongs || hasReachedEnd) return;
            loadSongs(debouncedSearch, page + 1);
          }}
        />
      )}
    </View>
  );
};

export default SearchResultMediaList;
