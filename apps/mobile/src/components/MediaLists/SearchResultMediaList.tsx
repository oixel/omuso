import { View, Text } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Song } from '@choral/types';

import { MediaList } from './MediaList';
import { SwipeableSongEntry } from '../MediaEntries';
import { search } from '@database';

const PAGE_SIZE = 200;

export function SearchResultMediaList({ searchQuery = '', horizontal = false }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

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
    setPage(0);
    setHasReachedEnd(false);

    (async () => {
      await loadSongs(searchQuery, 0);
    })();
  }, [searchQuery]);

  return (
    <View className="flex-1 w-full pb-4">
      {!songs.length && (
        <View className="w-full flex-1 flex justify-center items-center">
          <Text className="font-bold color-white">No results found</Text>
        </View>
      )}
      {songs.length > 0 && (
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
