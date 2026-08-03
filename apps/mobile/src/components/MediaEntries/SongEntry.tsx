import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useCallback } from 'react';
import { isSong, resizeCoverArt, usePlayback, useQueue } from '@omuso/domain';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { MediaListEntryProps } from './MediaListEntry';
import { Song } from '@omuso/types';

interface SongEntryProps extends MediaListEntryProps {
  showIsPlaying: boolean;
  showTrackNumber: boolean;
  showAlbumCover: boolean;
  showArtist: boolean;
}

// Bail before mounting proper SongEntry if item is not an actual Song
export const SongEntry: React.FC<SongEntryProps> = memo(
  (props) => {
    if (!isSong(props.item)) return null;
    return <InnerSongEntry {...props} item={props.item} />;
  },
  (prev, next) =>
    prev.item === next.item &&
    prev.horizontal === next.horizontal &&
    prev.showIsPlaying === next.showIsPlaying &&
    prev.showTrackNumber === next.showTrackNumber &&
    prev.showAlbumCover === next.showAlbumCover &&
    prev.showArtist === next.showArtist
);

// Type item to Song since it was proven to be
interface InnerSongEntryProps extends Omit<SongEntryProps, 'item'> {
  item: Song;
}

// Only rendered if item is Song, so all hooks are free to run safely
export const InnerSongEntry: React.FC<InnerSongEntryProps> = memo(
  ({
    item,
    horizontal,
    showIsPlaying,
    showTrackNumber,
    showAlbumCover,
    showArtist,
  }: InnerSongEntryProps) => {
    const currentPlayingId = useQueue((state) =>
      showIsPlaying ? state.queue[state.index]?.id : undefined
    );

    // Memoize method to avoid every render giving a new function reference
    const playSong = useCallback(() => {
      useQueue.getState().setQueue([item]);
      usePlayback.getState().play();
    }, [item]);

    // Only cause a re-render when the state actively changes
    const isPlaying = showIsPlaying && currentPlayingId === item.id;

    return (
      <Pressable
        style={[
          horizontal ? styles.rowHorizontal : styles.rowVertical,
          { backgroundColor: isPlaying ? '#5186dc' : '#60a5fa' },
        ]}
        onPress={playSong}
      >
        {item.starred ? (
          <View className="pb-2">
            <Star size={14} color="white" fill="white" />
          </View>
        ) : (
          <Star size={14} color="none" />
        )}
        <View style={horizontal ? styles.contentHorizontal : styles.contentVertical}>
          {showTrackNumber && (
            <Text
              style={{ marginRight: 4, alignSelf: 'center' }}
              className="text-blue-100 w-5 max-w-5"
            >
              {item.track}
            </Text>
          )}
          {showAlbumCover && (
            <Image
              style={styles.cover}
              source={{ uri: resizeCoverArt(item.coverArtURL, 100) }}
              contentFit="cover"
              recyclingKey={item.id}
              cachePolicy="memory-disk"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              transition={100}
            />
          )}
          <View className="flex-1 justify-center">
            <Text numberOfLines={1} ellipsizeMode="tail" className="text-white font-medium text-xl">
              {item.title || 'Untitled Song'}
            </Text>
            {showArtist && (
              <Text numberOfLines={1} ellipsizeMode="tail" className="text-blue-100">
                {item.artist ?? 'Unknown Artist'}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  },
  (prev: SongEntryProps, next: SongEntryProps) => prev.item === next.item
);

const styles = StyleSheet.create({
  rowVertical: {
    paddingHorizontal: 6,
    paddingTop: 12,
    minWidth: '100%',
    backgroundColor: '#60a5fa',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  contentVertical: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#adc9ed',
    borderRadius: 4,
    flex: 1,
    paddingBottom: 8,
    marginRight: 24,
    minHeight: 40,
  },
  contentHorizontal: {},
  rowHorizontal: {},
  cover: { height: 60, aspectRatio: 1, marginRight: 8, borderRadius: 4 },
});
