import { View, Pressable, Text, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';

import { SearchResultList } from '@components';

export type LabelOptions = 'all' | 'songs' | 'albums' | 'artists';
const labels: LabelOptions[] = ['all', 'songs', 'albums', 'artists'];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<LabelOptions>('all');

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="mt-24 items-center justify-center w-full gap-2">
        <TextInput
          style={{ borderRadius: 8 }}
          className="bg-white w-[90%] my-4 text-black placeholder:text-gray-600 px-2"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View className="flex-row gap-2">
          {labels.map((label) => (
            <Pressable
              key={label}
              onPress={() => setTab(label)}
              style={[styles.tabButton, tab === label && styles.selectedTab]}
              className="text-lg font-bold py-2 px-6 flex-row gap-4 justify-center items-center"
            >
              {/* <Play color="white" fill="white" size={20} /> */}
              <Text className="font-medium text-white text-lg">{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <SearchResultList searchQuery={searchQuery} tab={tab} />
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

export default Search;
