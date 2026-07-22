import { StyleProp, View, ViewStyle } from 'react-native';
import { useState, useEffect } from 'react';

import { Genre, GetGenresResult, Media } from '@choral/types';
import { useAuth } from '@choral/domain';

import MediaList from './MediaList';
import GenreEntry from '@components/MediaEntries/GenreEntry';
import { FlashListProps } from '@shopify/flash-list';

type GenreMediaListProps = {
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
} & Omit<FlashListProps<Media>, 'renderItem' | 'data'>;

const GenreMediaList = ({
  style = { height: 150, width: '100%' },
  horizontal = true,
  ...props
}: GenreMediaListProps) => {
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
    <View style={style}>
      <MediaList
        data={genres}
        Entry={GenreEntry}
        horizontal={horizontal}
        separator={() => <View style={{ width: 6, height: 6 }} />}
        {...props}
      />
    </View>
  );
};

export default GenreMediaList;
