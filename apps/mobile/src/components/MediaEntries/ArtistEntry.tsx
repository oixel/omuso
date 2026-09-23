import { isArtist } from '@omuso/domain';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { memo } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { MediaListEntryProps } from './MediaListEntry';
import { Artist } from '@omuso/types';
import { User2, Star } from 'lucide-react-native';

interface ArtistEntryProps extends MediaListEntryProps {
  pathRelativity: './' | '../../';
}

// Bail before mounting proper ArtistEntry if item is not an actual Artist
export const ArtistEntry: React.FC<ArtistEntryProps> = memo((props) => {
  if (!isArtist(props.item)) return null;
  return <InnerArtistEntry {...props} item={props.item} />;
});

// Type check item to Artist since it was proven to be
interface InnerArtistEntryProps extends Omit<ArtistEntryProps, 'item'> {
  item: Artist;
}

const InnerArtistEntry: React.FC<InnerArtistEntryProps> = memo(
  ({ item, pathRelativity, isBigEntry }: InnerArtistEntryProps) => {
    const queryClient = useQueryClient();

    return (
      <Link
        href={{ pathname: `${pathRelativity}/artist/[artistId]`, params: { artistId: item.id } }}
        relativeToDirectory
        withAnchor
        asChild
      >
        <Pressable
          style={isBigEntry ? styles.rowBig : styles.rowSmall}
          onPress={() => {
            queryClient.setQueryData(['artist', item.id], item); // Seed query for artist metadata
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
            source={{ uri: item.coverArtURL }}
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
                {item.name || 'Unknown Artist'}
              </Text>
              {isBigEntry && item.starred && <Star color="white" fill="white" size={14} />}
            </View>
            <View className="flex-row gap-2 items-center">
              {!isBigEntry && <User2 color="#dbeafe" size={16} />}
              <Text numberOfLines={1} ellipsizeMode="tail" className="text-blue-100">
                {!isBigEntry ? `Artist${item.albumCount ? '  •  ' : ''}` : ''}
                {item.albumCount ? item.albumCount + ' albums' : ''}
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
    (prev.item as Artist).starred === (next.item as Artist).starred &&
    (prev.item as Artist).coverArt === (next.item as Artist).coverArt
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
