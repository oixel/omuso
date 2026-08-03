import { AlbumList } from '@/src/components';
import { View, Text, StyleSheet } from 'react-native';

const Albums = () => {
  return (
    <View className="flex-1 justify-center items-center bg-blue-400">
      <Text className="font-bold text-white text-2xl pt-24 pb-6">Albums</Text>
      <AlbumList
        style={{ flex: 1, width: '100%', paddingHorizontal: 12 }}
        horizontal={false}
        numColumns={2}
      />
    </View>
  );
};

export default Albums;
