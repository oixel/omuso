import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { memo, useCallback } from 'react';
import { isSong, resizeCoverArt, usePlayback, useQueue } from '@omuso/domain';
import { Image } from 'expo-image';
import { Music, Star } from 'lucide-react-native';
import { MediaListEntryProps } from './MediaListEntry';
import { Song } from '@omuso/types';

interface SongEntryProps extends MediaListEntryProps {
  showIsPlaying: boolean;
  showTrackNumber: boolean;
  showAlbumCover: boolean;
  showSongLabel: boolean;
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
    prev.isBigEntry === next.isBigEntry &&
    prev.showIsPlaying === next.showIsPlaying &&
    prev.showTrackNumber === next.showTrackNumber &&
    prev.showAlbumCover === next.showAlbumCover &&
    prev.showSongLabel === next.showSongLabel &&
    prev.showArtist === next.showArtist &&
    prev.onPress === next.onPress
);

// Type item to Song since it was proven to be
interface InnerSongEntryProps extends Omit<SongEntryProps, 'item'> {
  item: Song;
}

// Only rendered if item is Song, so all hooks are free to run safely
export const InnerSongEntry: React.FC<InnerSongEntryProps> = memo(
  ({
    item,
    isBigEntry,
    showIsPlaying,
    showTrackNumber,
    showAlbumCover,
    showSongLabel,
    showArtist,
    onPress,
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
          isBigEntry ? styles.rowBig : styles.rowSmall,
          { backgroundColor: isPlaying ? '#5186dc' : '#60a5fa' },
          !showAlbumCover && { height: 60 },
        ]}
        onPress={() => {
          playSong();
          if (onPress) onPress(item);
        }}
      >
        {item.starred ? (
          <View
            style={[
              { height: '100%', justifyContent: 'center' },
              showTrackNumber && { paddingBottom: 8 },
            ]}
          >
            <Star size={14} color="white" fill="white" />
          </View>
        ) : (
          <Star size={14} color="none" />
        )}
        {showTrackNumber && (
          <Text
            style={{ marginRight: 4, paddingBottom: 8 }}
            className="text-blue-100 w-5 max-w-5 my-auto text-center"
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
        <View style={isBigEntry ? styles.textContentBig : styles.textContentSmall}>
          <Text numberOfLines={1} ellipsizeMode="tail" className="text-white font-medium text-xl">
            {item.title || 'Untitled Song'}
          </Text>
          {showArtist && (
            <View className="flex-row gap-2 items-center">
              {showSongLabel && <Music color="#dbeafe" size={16} />}
              <Text numberOfLines={1} ellipsizeMode="tail" className="text-blue-100">
                {showSongLabel ? 'Song  •  ' : ''}
                {item.artist ?? 'Unknown Artist'}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  },
  (prev: SongEntryProps, next: SongEntryProps) =>
    prev.item === next.item && prev.onPress === next.onPress // TODO memoize properly
);

const styles = StyleSheet.create({
  rowSmall: {
    minWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,

    height: 75,
    paddingHorizontal: 6,
    paddingTop: 12,
    backgroundColor: '#60a5fa',
  },
  rowBig: {},
  textContentSmall: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 4,

    paddingBottom: 8,
    marginRight: 24,
    minHeight: 40,

    borderBottomWidth: 1,
    borderBottomColor: '#adc9ed',
    borderRadius: 4,
  },
  textContentBig: {},
  cover: {
    height: 60,
    aspectRatio: 1,
    marginRight: 8,
    borderRadius: 4,
  },
});
