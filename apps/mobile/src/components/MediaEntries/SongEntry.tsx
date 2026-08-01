import { Media } from '@choral/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memo } from 'react';
import { isSong, resizeCoverArt, usePlayback, useQueue } from '@choral/domain';
import { Image } from 'expo-image';

interface SongEntryProps {
  item: Media;
  horizontal: boolean;
}

export const SongEntry: React.FC<SongEntryProps> = memo(
  ({ item, horizontal }: SongEntryProps) => {
    if (!isSong(item)) return;

    return (
      <Pressable
        style={horizontal ? styles.horizontal : styles.vertical}
        onPress={() => {
          useQueue.getState().setQueue([item]);
          usePlayback.getState().play();
        }}
      >
        <Image
          style={{ height: '100%', aspectRatio: 1 }}
          source={{ uri: resizeCoverArt(item.coverArtURL, 100) }}
          contentFit="cover"
          recyclingKey={item.id}
          cachePolicy="memory-disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={100}
        />
        <View className="border-b border-blue-500 flex-1 h-full">
          <Text numberOfLines={1} ellipsizeMode="tail" className="color-white font-medium text-xl">
            {item.title || 'Untitled Song'}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" className="color-blue-200">
            {item.artist ?? 'Unknown Artist'}
          </Text>
        </View>
      </Pressable>
    );
  },
  (prev: SongEntryProps, next: SongEntryProps) => prev.item.id === next.item.id
);

const styles = StyleSheet.create({
  vertical: {
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 80,
    gap: 12,
    minWidth: '100%',
    backgroundColor: '#60a5fa',
  },
  horizontal: {},
});
