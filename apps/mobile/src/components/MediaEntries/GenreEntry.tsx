import { convertStringToColor } from '@omuso/domain';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MediaListEntryProps } from './MediaListEntry';

export const GenreEntry: React.FC<MediaListEntryProps> = memo(
  ({ item, horizontal }: MediaListEntryProps) => {
    const router = useRouter();

    return (
      <Pressable
        style={[
          horizontal ? styles.horizontal : styles.vertical,
          { backgroundColor: convertStringToColor(item.id, 5, 85, 45) },
        ]}
        onPress={() => router.navigate({ pathname: '/genres/[genre]', params: { genre: item.id } })}
      >
        <Text className="text-white font-bold">{item.id}</Text>
      </Pressable>
    );
  },
  (prev: MediaListEntryProps, next: MediaListEntryProps) => prev.item.id === next.item.id
);

const styles = StyleSheet.create({
  vertical: {
    height: 100,
    flex: 1,
    borderRadius: 16,
    borderColor: '#fff',
    borderWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginHorizontal: 3,
    backgroundColor: '#000000',
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
