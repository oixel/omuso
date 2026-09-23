import { StyleProp, View, ViewStyle } from 'react-native';
import { useState, useEffect } from 'react';

import { Artist, Media } from '@omuso/types';
import { useAuth } from '@omuso/domain';

import { MediaList } from './MediaList';
import { ArtistEntry } from '../MediaEntries';
import { FlashListProps } from '@shopify/flash-list';
import { useSyncArtists } from '@utils';
import { MediaListEntryProps } from '../MediaEntries/MediaListEntry';

type ArtistListProps = {
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
} & Omit<FlashListProps<Media>, 'renderItem' | 'data'>;

const PAGE_SIZE = 500;

const ConstructedArtistEntry = (props: MediaListEntryProps) => (
  <ArtistEntry {...props} pathRelativity="./" />
);

export function ArtistList({
  style = { height: 150, width: '100%' },
  horizontal = true,
  ...props
}: ArtistListProps) {
  const client = useAuth((state) => state.client);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [page, setPage] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useSyncArtists(setArtists);

  const loadArtists = async (newPage: number) => {
    setPage(newPage);

    const result = await client?.getArtists();
    const newArtists = result?.artists ?? [];

    setArtists((prev) => (newPage === 0 ? newArtists : [...prev, ...newArtists]));
    if (newArtists.length < PAGE_SIZE) setHasReachedEnd(true);
  };

  useEffect(() => {
    setPage(0);
    setHasReachedEnd(false);
    loadArtists(0);
  }, [client]);

  return (
    <View style={style}>
      <MediaList
        data={artists}
        Entry={ConstructedArtistEntry}
        isBigEntry={true}
        horizontal={horizontal}
        separator={() => <View style={{ width: 6, height: 4 }} />}
        {...props}
        onEndReached={() => {
          if (!hasReachedEnd) loadArtists(page + 1);
        }}
      />
    </View>
  );
}
