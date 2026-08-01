import { Media } from '@omuso/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memo } from 'react';
import { isSong, resizeCoverArt, usePlayback, useQueue } from '@omuso/domain';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';

interface SongEntryProps {
  item: Media;
  horizontal: boolean;
}

export const SongEntry: React.FC<SongEntryProps> = memo(
  ({ item, horizontal }: SongEntryProps) => {
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
          <Star size={14} color="white" fill="white" />
        ) : (
          <Star size={14} color="none" />
        )}
        <View style={horizontal ? styles.contentHorizontal : styles.contentVertical}>
          <Image
            style={{ height: '100%', aspectRatio: 1 }}
            source={{ uri: resizeCoverArt(item.coverArtURL, 100) }}
            contentFit="cover"
            recyclingKey={item.id}
            cachePolicy="memory-disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={100}
          />
          <View style={{ marginHorizontal: 12 }} className="flex-1 h-full justify-center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="color-white font-medium text-xl"
            >
              {item.title || 'Untitled Song'}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="color-blue-200">
              {item.artist ?? 'Unknown Artist'}
            </Text>
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
    height: 80,
    minWidth: '100%',
    backgroundColor: '#60a5fa',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    // justifyContent: 'flex-start',
  },
  contentVertical: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#527fb6',
    borderRadius: 4,
    flex: 1,
    paddingBottom: 8,
  },
  contentHorizontal: {},
  rowHorizontal: {},
});
