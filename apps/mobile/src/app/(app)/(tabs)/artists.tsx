import { ArtistList } from '@components';
import { View, Text } from 'react-native';

const Artists = () => {
  return (
    <View className="flex-1 justify-center items-center bg-blue-400">
      <Text className="font-bold text-white text-2xl pt-24 pb-6">Artists</Text>
      <ArtistList
        style={{ flex: 1, width: '100%', paddingHorizontal: 12 }}
        horizontal={false}
        numColumns={2}
      />
    </View>
  );
};

export default Artists;
