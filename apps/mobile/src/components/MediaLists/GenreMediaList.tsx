import { Pressable, StyleProp, View, ViewStyle, Text } from 'react-native';
import { useState, useEffect } from 'react';

import { Media } from '@omuso/types';
import { useAuth } from '@omuso/domain';

import { MediaList } from './MediaList';
import { GenreEntry } from '../MediaEntries';
import { FlashListProps } from '@shopify/flash-list';

type GenreMediaListProps = {
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
} & Omit<FlashListProps<Media>, 'renderItem' | 'data'>;

export function GenreMediaList({
  style = { height: 150, width: '100%' },
  horizontal = true,
  ...props
}: GenreMediaListProps) {
  const client = useAuth((state) => state.client);
  const [genres, setGenres] = useState<Media[]>([]);

  const loadGenres = async () => {
    if (!client) return;
    const response = await client.getGenres();
    if (response.success && response.genres) {
      const mediaGenres: Media[] = response.genres.map((name) => ({ id: name }));
      setGenres(mediaGenres);
    }
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
}
