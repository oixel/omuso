import { View, Text, TextInput } from 'react-native';
import { useState } from 'react';

import SearchResultMediaList from '@components/MediaLists/SearchResultMediaList';

const Search = () => {
  const [search, setSearch] = useState('');

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="mt-24 items-center justify-center w-full">
        <Text className="text-2xl text-white font-bold">Search</Text>
        <TextInput
          className="bg-white w-2/3 my-4 color-black placeholder:color-gray-600"
          autoCapitalize="none"
          autoCorrect={false}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <SearchResultMediaList search={search} />
    </View>
  );
};

export default Search;
