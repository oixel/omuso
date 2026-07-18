import { Media } from '@choral/types';
import { Pressable, Text } from 'react-native';

interface GenreEntryProps {
  item: Media;
}

const GenreEntry: React.FC<GenreEntryProps> = ({ item }: GenreEntryProps) => {
  return (
    <Pressable
      style={{
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
      }}
    >
      <Text className="color-white font-bold">{item.id}</Text>
    </Pressable>
  );
};

export default GenreEntry;
