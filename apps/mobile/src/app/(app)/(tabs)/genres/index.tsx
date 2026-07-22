import { Text, View } from 'react-native';

import GenreMediaList from '@components/MediaLists/GenreMediaList';

const Genres = () => {
  return (
    <View className="flex-1 justify-center items-center bg-blue-400">
      <Text className="font-bold text-white text-2xl pt-24 pb-12">Genres</Text>
      <GenreMediaList
        style={{ flex: 1, width: '100%', paddingHorizontal: 12 }}
        horizontal={false}
        numColumns={2}
      />
    </View>
  );
};

export default Genres;
