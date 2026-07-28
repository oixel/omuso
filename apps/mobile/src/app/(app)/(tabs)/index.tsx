import { View, Text, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { useQueue, usePlayback } from '@choral/domain';
import { Image } from 'expo-image';
import { Play, Pause, SkipBack, SkipForward, ListX } from 'lucide-react-native';
import { clearDatabase, getArtist } from '@database';
import { sync } from '@database';

const Home = () => {
  const router = useRouter();
  const { logout, client } = useAuth();

  const { removeFromQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);
  const { togglePause, prev, skip } = usePlayback();
  const isPlaying = usePlayback((state) => state.isPlaying);

  const artistId = queue[index]?.artistId;
  const artist = artistId ? (getArtist(artistId)?.name ?? 'Unknown Artist') : 'Unknown Artist';

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-shrink items-center justify-center w-full gap-2">
        <Text className="font-extrabold color-white text-5xl mb-12">choral</Text>
        <Image
          style={{ height: '50%', aspectRatio: 1 }}
          source={{ uri: queue[index]?.coverArtURL }}
          contentFit="cover"
          recyclingKey={queue[index]?.id}
          cachePolicy="memory-disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        <Text className="text-xl font-bold color-white mt-5">
          {queue[index]?.title || 'No song'}
        </Text>
        <Text className="mb-5 font-medium text-xl">{artist}</Text>
        <View className="flex flex-row gap-2">
          <Pressable onPress={() => removeFromQueue(index)}>
            <ListX color="white" size={32} />
          </Pressable>
          <Pressable onPress={prev}>
            <SkipBack color="white" size={32} />
          </Pressable>
          <Pressable onPress={togglePause}>
            {isPlaying && <Pause color="white" size={32} />}
            {!isPlaying && <Play color="white" size={32} />}
          </Pressable>
          <Pressable onPress={skip}>
            <SkipForward color="white" size={32} />
          </Pressable>
        </View>
      </View>

      <Button
        title="Sync DB"
        onPress={() => {
          if (client) sync(client);
        }}
      />
      <View className="mb-4"></View>
      <Button title="Clear DB" onPress={clearDatabase} />
      <View className="mb-4"></View>
      <Button
        title="Log Out"
        onPress={() => {
          destroyAudioPlayer();
          logout();
          router.replace('/login');
        }}
      />
      <View className="mb-8"></View>
    </View>
  );
};

export default Home;
