import { getSongsByGenre } from '@database';
import { Song } from '@choral/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SwipeableSongEntry, MediaList } from '@components';

const Genre = () => {
  const { genre } = useLocalSearchParams();
  const [songs, setSongs] = useState<Song[]>();
  const router = useRouter();

  useEffect(() => {
    getSongsByGenre(genre as string).then(setSongs);

    return () => {
      setSongs([]);
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <Pressable
        onPress={router.back}
        style={{ paddingLeft: 18, marginTop: 75, alignSelf: 'flex-start' }}
        className="text-xl text-white font-bold"
      >
        <Text>{'< Go Back'}</Text>
      </Pressable>
      <Text style={{ paddingTop: 25, paddingBottom: 25 }} className="text-2xl text-white font-bold">
        {genre}
      </Text>
      <View className="flex-1 w-full pb-4">
        <MediaList data={songs} Entry={SwipeableSongEntry} horizontal={false} />
      </View>
    </View>
  );
};

export default Genre;
