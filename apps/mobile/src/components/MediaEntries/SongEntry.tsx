import { Media } from '@omuso/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memo } from 'react';
import { isSong, resizeCoverArt, usePlayback, useQueue } from '@omuso/domain';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import { MediaListEntryProps } from './MediaListEntry';

export interface SongEntryProps extends MediaListEntryProps {
  showTrackNumber: boolean;
  showAlbumCover: boolean;
  showArtist: boolean;
}

export const SongEntry: React.FC<SongEntryProps> = memo(
  ({ item, horizontal, showTrackNumber, showAlbumCover, showArtist }: SongEntryProps) => {
    if (!isSong(item)) return;

    return (
      <Pressable
        style={horizontal ? styles.rowHorizontal : styles.rowVertical}
        onPress={() => {
          useQueue.getState().setQueue([item]);
          usePlayback.getState().play();
        }}
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
              className="color-blue-100 w-5 max-w-5"
            >
              {item.track}
            </Text>
          )}
          {showAlbumCover && (
            <Image
              style={{ height: 60, aspectRatio: 1, marginRight: 8, borderRadius: 4 }}
              source={{ uri: resizeCoverArt(item.coverArtURL, 100) }}
              contentFit="cover"
              recyclingKey={item.id}
              cachePolicy="memory-disk"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              transition={100}
            />
          )}
          <View className="flex-1 justify-center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="color-white font-medium text-xl"
            >
              {item.title || 'Untitled Song'}
            </Text>
            {showArtist && (
              <Text numberOfLines={1} ellipsizeMode="tail" className="color-blue-100">
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
});
