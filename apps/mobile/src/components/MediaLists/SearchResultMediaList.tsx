import { View, Text } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useAuth, useDebounce } from '@choral/domain';
import { Song, SearchResult } from '@choral/types';

import MediaList from './MediaList';
import SongEntry from '@components/MediaEntries/SongEntry';

const SearchResultMediaList = ({ search = '', horizontal = false }) => {
  const client = useAuth((state) => state.client);

  const PAGE_SIZE = 200;
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const debouncedSearch = useDebounce(search, 300); // Debounces every time search is updated

  const latestQuery = useRef('');

  const loadSongs = async (
    query: string,
    songCount: number,
    newPage: number
  ): Promise<SearchResult> => {
    if (!client) return { success: false };

    latestQuery.current = query;
    setPage(newPage);

    setIsLoadingSongs(true);

    const result = await client.search({
      query: query,
      artistCount: 0,
      albumCount: 0,
      songCount,
      songOffset: newPage * songCount,
    });

    // Discard current result if a newer query exists
    if (latestQuery.current !== query) return result;

    if (result?.songs) {
      const newSongs = result.songs; // Capture narrowed value to use in setSongs closure
      setSongs((prev) => [...prev, ...newSongs]);
    }

    setIsLoadingSongs(false);

    return result;
  };

  const initialLoad = async () => {
    await loadSongs(search, PAGE_SIZE, 0);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    if (!isInitialLoad) {
      setSongs([]);
      setPage(0);
      setHasReachedEnd(false);
      loadSongs(debouncedSearch, PAGE_SIZE, 0);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    initialLoad();

    return () => {
      setSongs([]);
    };
  }, [client]);

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

            const result = await loadSongs(search, PAGE_SIZE, page + 1);
            if (!result.songs?.length || result.songs.length < PAGE_SIZE) setHasReachedEnd(true);
          }}
        />
      )}
    </View>
  );
};

export default SearchResultMediaList;
