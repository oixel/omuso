import { isAlbum, resizeCoverArt } from '@omuso/domain';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { memo } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { MediaListEntryProps } from './MediaListEntry';
import { Album } from '@omuso/types';
import { LibrarySquare, Star } from 'lucide-react-native';

interface AlbumEntryProps extends MediaListEntryProps {
  pathRelativity: './' | '../../';
  showArtistName?: boolean;
  showYear?: boolean;
}

// Bail before mounting proper AlbumEntry if item is not an actual Album
export const AlbumEntry: React.FC<AlbumEntryProps> = memo((props) => {
  if (!isAlbum(props.item)) return null;
  return <InnerAlbumEntry {...props} item={props.item} />;
});

// Type check item to Album since it was proven to be
interface InnerAlbumEntryProps extends Omit<AlbumEntryProps, 'item'> {
  item: Album;
}

// Only rendered if item is Album
const InnerAlbumEntry: React.FC<InnerAlbumEntryProps> = memo(
  ({
    item,
    pathRelativity,
    isBigEntry,
    showArtistName: showArtist = true,
    showYear: showDate = false,
    onPress,
  }: InnerAlbumEntryProps) => {
    const queryClient = useQueryClient();

    return (
      <Link
        href={{ pathname: `${pathRelativity}album/[albumId]`, params: { albumId: item.id } }}
        relativeToDirectory
        withAnchor
        asChild
      >
        <Pressable
          style={isBigEntry ? styles.rowBig : styles.rowSmall}
          onPress={() => {
            queryClient.setQueryData(['album', item.id], item); // Seed query for album metadata
            if (onPress) onPress(item);
          }}
        >
          {!isBigEntry && item.starred ? (
            <View>
              <Star size={14} color="white" fill="white" />
            </View>
          ) : (
            <Star size={14} color="none" />
          )}
          <Image
            style={isBigEntry ? styles.coverBig : styles.coverSmall}
            source={{ uri: resizeCoverArt(item.coverArtURL, 500) }}
            contentFit="cover"
            recyclingKey={item.id}
            cachePolicy="memory-disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            transition={100}
          />
          <View
            style={[
              isBigEntry ? styles.textContentBig : styles.textContentSmall,
              isBigEntry && item.starred && { paddingRight: 20 },
            ]}
          >
            <View className="flex-row gap-2 items-center">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={`text-white font-medium ${isBigEntry ? 'text-lg' : 'text-xl'}`}
              >
                {item.name || 'Untitled Album'}
              </Text>
              {isBigEntry && item.starred && <Star color="white" fill="white" size={14} />}
            </View>
            <View className="flex-row gap-2 items-center">
              {!isBigEntry && <LibrarySquare color="#dbeafe" size={16} />}
              <Text numberOfLines={1} ellipsizeMode="tail" className="text-blue-100">
                {!isBigEntry ? 'Album  •  ' : ''}
                {(showDate && item.originalReleaseDate?.year) ?? ''}
                {(showArtist && item.artist) ?? 'Unknown Artist'}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>
    );
  },
  (prev: MediaListEntryProps, next: MediaListEntryProps) =>
    prev.item.id === next.item.id &&
    prev.isBigEntry === next.isBigEntry &&
    (prev.item as Album).starred === (next.item as Album).starred &&
    prev.onPress === next.onPress
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
  rowBig: {
    flex: 1,
    margin: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    height: 230,
    width: 180,
  },
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
  textContentBig: {
    flex: 1,
    width: '95%',
  },
  coverSmall: {
    height: 60,
    aspectRatio: 1,
    marginRight: 8,
    borderRadius: 4,
  },
  coverBig: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 8,
    marginBottom: 6,
  },
});
