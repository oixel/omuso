import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

const Genre = () => {
  const { genre } = useLocalSearchParams();

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <Text className="text-2xl text-white font-bold">{genre}</Text>
    </View>
  );
};

export default Genre;
