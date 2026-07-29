import { View, Text } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Song } from '@choral/types';

import MediaList from './MediaList';
import { asSwipeable } from '../MediaEntries/asSwipeable';
import SongEntry from '@components/MediaEntries/SongEntry';
import { search } from '@database';

import { ListStart, ListEnd } from 'lucide-react-native';
import { isSong, useQueue } from '@choral/domain';

const PAGE_SIZE = 200;

const SearchResultMediaList = ({ searchQuery = '', horizontal = false }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const { addNext, addToEnd } = useQueue();

  const latestQuery = useRef('');

  const swipeableSongEntry = asSwipeable(
    SongEntry,
    [],
    [
      {
        Content: () => <ListStart color="white" />,
        onPress: (item) => {
          if (!item) return;
          if (isSong(item)) addNext([item]);
        },
        backgroundColor: '#3b82f6',
      },
      {
        Content: () => <ListEnd color="white" />,
        onPress: (item) => {
          if (!item) return;
          if (isSong(item)) addToEnd([item]);
        },
        backgroundColor: '#3b82f6',
      },
    ]
  ); // Allow entry to be swiped

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
          Entry={swipeableSongEntry}
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
};

export default SearchResultMediaList;
