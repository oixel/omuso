import { View } from 'react-native';
import { useState, useEffect } from 'react';

import { Genre, GetGenresResult } from '@choral/types';
import { useAuth } from '@choral/domain';

import MediaList from '@/src/components/MediaLists/MediaList';
import GenreEntry from '@components/MediaEntries/GenreEntry';

const GenreMediaList = ({ horizontal = true }) => {
  const client = useAuth((state) => state.client);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [genres, setGenres] = useState<Genre[]>([]);

  const loadGenres = async (): Promise<GetGenresResult> => {
    if (!client) return { success: false };

    const result = await client.getGenres();
    if (result.genres) setGenres(result.genres);

    return result;
  };

  const initialLoad = async () => {
    await loadGenres();
    setIsInitialLoad(false);
  };

  useEffect(() => {
    if (!isInitialLoad) {
      setGenres([]);
      loadGenres();
    }
  }, []);

  useEffect(() => {
    initialLoad();

    return () => {
      setGenres([]);
    };
  }, [client]);

  return (
    <View
      style={{
        height: 110, // TODO: look into how to make height fit content rather than being manually set
      }}
    >
      <MediaList
        data={genres}
        Entry={GenreEntry}
        horizontal={horizontal}
        separator={() => <View style={{ width: 6 }} />}
      />
    </View>
  );
};

export default GenreMediaList;
