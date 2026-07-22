import { convertStringToColor } from '@choral/domain';
import { Media } from '@choral/types';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

interface GenreEntryProps {
  item: Media;
  horizontal: boolean;
}

const GenreEntry: React.FC<GenreEntryProps> = ({ item, horizontal }: GenreEntryProps) => {
  const router = useRouter();

  return (
    <Pressable
      style={[
        horizontal ? styles.horizontal : styles.vertical,
        { backgroundColor: convertStringToColor(item.id, 5, 85, 45) },
      ]}
      onPress={() => router.navigate({ pathname: '/genres/[genre]', params: { genre: item.id } })}
    >
      <Text className="color-white font-bold">{item.id}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  vertical: {},
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

export default GenreEntry;
