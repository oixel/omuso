import { StyleProp, View, ViewStyle } from 'react-native';
import { useState, useEffect } from 'react';

import { Album, Media } from '@omuso/types';
import { useAuth } from '@omuso/domain';

import { MediaList } from './MediaList';
import { AlbumEntry } from '../MediaEntries';
import { FlashListProps } from '@shopify/flash-list';
import { useSyncAlbums } from '@utils';
import { MediaListEntryProps } from '../MediaEntries/MediaListEntry';

type AlbumListProps = {
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
} & Omit<FlashListProps<Media>, 'renderItem' | 'data'>;

const PAGE_SIZE = 500;

const ConstructedAlbumEntry = (props: MediaListEntryProps) => (
  <AlbumEntry {...props} pathRelativity="./" />
);

export function AlbumList({
  style = { height: 150, width: '100%' },
  horizontal = true,
  ...props
}: AlbumListProps) {
  const client = useAuth((state) => state.client);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [page, setPage] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useSyncAlbums(setAlbums);

  const loadAlbums = async (newPage: number) => {
    setPage(newPage);

    const result = await client?.getAlbumList({
      type: 'alphabeticalByArtist',
      size: PAGE_SIZE,
      offset: newPage * PAGE_SIZE,
    });
    const newAlbums = result?.albums ?? [];

    setAlbums((prev) => (newPage === 0 ? newAlbums : [...prev, ...newAlbums]));
    if (newAlbums.length < PAGE_SIZE) setHasReachedEnd(true);
  };

  useEffect(() => {
    setPage(0);
    setHasReachedEnd(false);
    loadAlbums(0);
  }, [client]);

  return (
    <View style={style}>
      <MediaList
        data={albums}
        Entry={ConstructedAlbumEntry}
        isBigEntry={true}
        horizontal={horizontal}
        separator={() => <View style={{ width: 6, height: 4 }} />}
        {...props}
        onEndReached={() => {
          if (!hasReachedEnd) loadAlbums(page + 1);
        }}
      />
    </View>
  );
}
