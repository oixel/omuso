import { Pressable, StyleProp, View, ViewStyle, Text } from 'react-native';
import { useState, useEffect } from 'react';

import { Album, Media } from '@omuso/types';
import { useAuth } from '@omuso/domain';

import { MediaList } from './MediaList';
import { AlbumEntry, GenreEntry } from '../MediaEntries';
import { FlashListProps } from '@shopify/flash-list';

type AlbumListProps = {
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
} & Omit<FlashListProps<Media>, 'renderItem' | 'data'>;

export function AlbumList({
  style = { height: 150, width: '100%' },
  horizontal = true,
  ...props
}: AlbumListProps) {
  const client = useAuth((state) => state.client);
  const [albums, setAlbums] = useState<Album[]>([]);

  const loadAlbums = async () => {
    if (!client) return;
    const response = await client.getAlbumList({ type: 'alphabeticalByArtist', size: 500 });
    if (response.success && response.albums) setAlbums(response.albums);
  };

  useEffect(() => {
    loadAlbums();

    return () => {
      setAlbums([]);
    };
  }, [client]);

  return (
    <View style={style}>
      <MediaList
        data={albums}
        Entry={AlbumEntry}
        horizontal={horizontal}
        separator={() => <View style={{ width: 6, height: 4 }} />}
        {...props}
      />
    </View>
  );
}
