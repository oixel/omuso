import { isAlbum, resizeCoverArt } from '@omuso/domain';
import { Media } from '@omuso/types';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface AlbumEntryProps {
  item: Media;
  horizontal: boolean;
}

export const AlbumEntry: React.FC<AlbumEntryProps> = memo(
  ({ item, horizontal }: AlbumEntryProps) => {
    if (!isAlbum(item)) return;

    const router = useRouter();
    const queryClient = useQueryClient();

    return (
      <Pressable
        style={[horizontal ? styles.horizontal : styles.vertical]}
        onPress={() => {
          queryClient.setQueryData(['album', item.id], item); // Seed query
          router.navigate({ pathname: '/albums/[albumId]', params: { albumId: item.id } });
        }}
      >
        <Image
          style={{ width: '100%', aspectRatio: 1, borderRadius: 8 }}
          source={{ uri: resizeCoverArt(item.coverArtURL, 500) }}
          contentFit="cover"
          recyclingKey={item.id}
          cachePolicy="memory-disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={100}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ width: '90%' }}
          className="color-white font-medium pt-2"
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ width: '90%' }}
          className="font-white color-slate-700"
        >
          {item.artist || 'Unknown Artist'}
        </Text>
      </Pressable>
    );
  },
  (prev: AlbumEntryProps, next: AlbumEntryProps) => prev.item.id === next.item.id
);

const styles = StyleSheet.create({
  vertical: {
    flex: 1,
    margin: 2,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    height: 210,
  },
  horizontal: {
    height: 100,
    width: 150,
    borderRadius: 16,
    borderColor: '#fff',
    borderWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#000000',
  },
});
