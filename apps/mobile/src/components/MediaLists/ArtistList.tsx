import { StyleProp, View, ViewStyle } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { ViewToken } from 'react-native';

import { Artist, Media } from '@omuso/types';
import { useAuth, getArtistData } from '@omuso/domain';

import { MediaList } from './MediaList';
import { ArtistEntry } from '../MediaEntries';
import { FlashListProps } from '@shopify/flash-list';
import { useSyncArtists } from '@utils';

type ArtistListProps = {
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
} & Omit<FlashListProps<Media>, 'renderItem' | 'data'>;

const PAGE_SIZE = 500;

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

  // Track IDs that have already been fetched to avoid re-fetching
  const fetched = useRef(new Set<string>());

  // Constant definition describing what considers an item as "visible"
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60, // Percentage of item on screen
    minimumViewTime: 250, // Time on screen (ms) before being considered visible
  }).current;

  // When the visible artists change, fetch their artist images (if not already fetched)
  const onViewableItemsChanged = useRef(({ viewable }: { viewable: ViewToken[] }) => {
    viewable.forEach((viewToken) => {
      const artist = viewToken.item as Artist | undefined;
      if (!artist || fetched.current.has(artist.id)) return;

      fetched.current.add(artist.id);

      getArtistData(artist, true).then((data) => {
        if (!data.artistImageURLs) return;
        setArtists((prev) =>
          prev.map((curr) =>
            curr.id === artist.id ? { ...curr, artistImageURLs: data.artistImageURLs } : curr
          )
        );
      });
    });
  });

  return (
    <View style={style}>
      <MediaList
        data={artists}
        Entry={ArtistEntry}
        isBigEntry={true}
        horizontal={horizontal}
        separator={() => <View style={{ width: 6, height: 4 }} />}
        {...props}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={() => onViewableItemsChanged}
        onEndReached={() => {
          if (!hasReachedEnd) loadArtists(page + 1);
        }}
      />
    </View>
  );
}
