import { View, Pressable, Text, TextInput, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import { SearchResultList } from '@components';
import { SearchPageLabelOptions } from '@omuso/types';
import { useHistory } from '@omuso/domain';
import { SearchIcon, X } from 'lucide-react-native';

const labels: SearchPageLabelOptions[] = ['all', 'songs', 'albums', 'artists'];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<SearchPageLabelOptions>('all');
  const history = useHistory((state) => state.history);
  const clearHistory = useHistory((state) => state.clearHistory);

  useEffect(() => {
    if (searchQuery.length === 0) setTab('all');
  }, [searchQuery]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="mt-24 items-center justify-center w-full gap-2">
        <View className="w-[90%] my-4 px-2 flex-row items-center">
          <SearchIcon
            size={24}
            strokeWidth={2}
            stroke={'white'}
            style={{ marginRight: 8, marginBottom: 4 }}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Search for songs, albums, or artists"
            className="text-white placeholder:text-blue-100 flex-1 caret-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length !== 0 && (
            <X size={24} strokeWidth={2} stroke={'white'} onPress={() => setSearchQuery('')} />
          )}
        </View>

        {searchQuery.length !== 0 ? (
          <View className="flex-row gap-2">
            {labels.map((label) => (
              <Pressable
                key={label}
                onPress={() => setTab(label)}
                style={[styles.tabButton, tab === label && styles.selectedTab]}
                className="text-lg font-bold py-2 px-6 flex-row gap-4 justify-center items-center"
              >
                <Text className="font-medium text-white text-lg">{label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          history.length !== 0 && (
            <View className="flex w-[90%] flex-row items-center border-b-[#cadef9] border-b-2 pb-2">
              <Text className="text-white font-bold text-3xl flex-1">History</Text>
              <Pressable onPress={() => clearHistory()}>
                <Text className="text-blue-200 text-lg font-medium pr-4">Clear</Text>
              </Pressable>
            </View>
          )
        )}
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
