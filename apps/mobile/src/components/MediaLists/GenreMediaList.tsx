import { Pressable, StyleProp, View, ViewStyle, Text } from 'react-native';
import { useState, useEffect } from 'react';

import { Media } from '@choral/types';
import { useAuth } from '@choral/domain';

import MediaList from './MediaList';
import GenreEntry from '@components/MediaEntries/GenreEntry';
import { FlashListProps } from '@shopify/flash-list';
import { getGenres } from '@database';

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
  const [genres, setGenres] = useState<Media[]>([]);

  const loadGenres = async () => {
    const loadedGenres = await getGenres();
    const mediaGenres: Media[] = loadedGenres.map((name) => ({ id: name }));
    setGenres(mediaGenres);
  };

  useEffect(() => {
    loadGenres();

    return () => {
      setGenres([]);
    };
  }, [client]);

  return (
    <View style={style}>
      <Pressable onPress={loadGenres}>
        <Text>Reload genres</Text>
      </Pressable>
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
