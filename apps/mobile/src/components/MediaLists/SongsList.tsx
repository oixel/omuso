import { View, Text } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { Song } from '@omuso/types';

import { SwipeableSongEntry } from '../Swipeables/SwipeableSongEntry';
import { useAuth } from '@omuso/domain';
import { useSyncSongs } from '@utils';
import { MediaList } from './MediaList';

const PAGE_SIZE = 100;

interface SongsListProps {
  onlyStarred?: boolean;
  horizontal?: boolean;
}

export function SongsList({ onlyStarred = false, horizontal = false }: SongsListProps) {
  const { client } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [page, setPage] = useState(0);
  const [songs, setSongs] = useState<Song[]>([]);

  useSyncSongs(setSongs);

  const loadSongs = async (newPage: number) => {
    setIsLoading(true);
    setPage(newPage);

    const result = await client?.search({
      query: '',
      songCount: PAGE_SIZE,
      songOffset: newPage * PAGE_SIZE,
    });

    const newSongs = result?.songs ?? [];
    if (newSongs.length < PAGE_SIZE) setHasReachedEnd(true);

    setSongs((prev) => (newPage === 0 ? newSongs : [...prev, ...newSongs]));
    setIsLoading(false);
  };

  useEffect(() => {
    loadSongs(0);
  }, [onlyStarred]);

  // Use SwipeableSongEntry factory to create song entry that only changes on mount
  const SongEntry = useMemo(() => SwipeableSongEntry(false, false, true, true, true), []);

  return (
    <View className="flex-1 w-full pb-4">
      {!isLoading && !songs.length && (
        <View className="w-full flex-1 flex justify-start mt-12 items-center">
          <Text className="font-bold text-white">No results found</Text>
        </View>
      )}
      {/* Render all lists, but swap display status based on current tab */}
      <MediaList
        data={songs}
        Entry={SongEntry}
        isBigEntry={false}
        horizontal={horizontal}
        onEndReached={() => {
          if (!hasReachedEnd) loadSongs(page + 1);
        }}
        footer={() => (
          <View className="flex items-center justify-center py-2">
            {isLoading && <Text className="color-blue-200 font-medium text-lg">Loading...</Text>}
            {hasReachedEnd && (
              <Text className="color-blue-200 font-medium text-lg">End of results</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
