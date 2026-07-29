import { Media } from '@choral/types';
import { Image } from 'expo-image';
import { Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import { memo } from 'react';
import { isSong, resizeCoverArt, usePlayback, useQueue } from '@choral/domain';
import { getArtist } from '@/src/database';

interface SongEntryProps {
  item: Media;
  horizontal: boolean;
}

const SongEntry: React.FC<SongEntryProps> = memo(
  ({ item, horizontal }: SongEntryProps) => {
    if (!isSong(item)) return;
    const artist = item.artistId ? getArtist(item.artistId) : undefined;

    const useTitleTicker = item.title.length > 35;
    const useArtistTicker = (artist?.name?.length ?? 0) > 35;

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
        />
        <View className="border-b border-blue-500 flex-1 h-full">
          {useTitleTicker ? (
            <TextTicker
              scrollSpeed={25}
              marqueeDelay={1500}
              repeatSpacer={30}
              easing={Easing.linear}
              animationType="scroll"
              className="color-white font-medium text-xl"
            >
              {item.title || 'Untitled Song'}
            </TextTicker>
          ) : (
            <Text className="color-white font-medium text-xl">{item.title || 'Untitled Song'}</Text>
          )}
          {useArtistTicker ? (
            <TextTicker
              scrollSpeed={25}
              marqueeDelay={1500}
              repeatSpacer={30}
              easing={Easing.linear}
              animationType="scroll"
              style={{ lineHeight: 18, fontSize: 15 }}
              className="color-blue-200"
            >
              {artist?.name ?? 'Unknown Artist'}
            </TextTicker>
          ) : (
            <Text className="color-blue-200"> {artist?.name ?? 'Unknown Artist'}</Text>
          )}
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

export default SongEntry;
