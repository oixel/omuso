import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useState } from 'react';

import { SongsList } from '@components';
import { Star } from 'lucide-react-native';

const Songs = () => {
  const [onlyStarred, setOnlyStarred] = useState(false);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="mt-24 items-center justify-center w-full gap-2">
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setOnlyStarred((state) => !state)}
            style={[styles.tabButton, onlyStarred && styles.selectedTab]}
            className="text-lg font-bold py-2 px-6 flex-row gap-4 justify-center items-center"
          >
            <Star color="white" fill={onlyStarred ? 'white' : 'none'} />
          </Pressable>
        </View>
      </View>
      <SongsList onlyStarred={onlyStarred} />
    </View>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#5186dc',
  },
  selectedTab: {
    backgroundColor: '#6298f0',
    borderWidth: 1,
    borderColor: 'white',
  },
});

export default Songs;
