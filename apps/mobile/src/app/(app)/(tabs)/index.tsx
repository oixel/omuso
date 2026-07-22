import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { useQueue, usePlayback } from '@choral/domain';
import { Image } from 'expo-image';

const Home = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const { removeFromQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);
  const { togglePause, prev, skip } = usePlayback();
  const isPlaying = usePlayback((state) => state.isPlaying);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-shrink pb-4 items-center justify-center w-full gap-2 mb-12">
        <Text className="font-extrabold color-white text-5xl mb-12">choral</Text>
        <Image
          style={{ height: '50%', aspectRatio: 1 }}
          source={{ uri: queue[index].fullSizeCoverArtURL }}
          contentFit="cover"
          recyclingKey={queue[index].id}
          cachePolicy="memory-disk"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          // onTouchStart={() => console.log(queue[index].coverArtURL)}
        />
        <Text className="text-xl font-bold color-white mt-5">{queue[index].title}</Text>
        <Text className="mb-5 font-medium text-xl">{queue[index].artist || 'Unknown Artist'}</Text>
        <View className="flex flex-row gap-2">
          <Button title="🚮" onPress={() => removeFromQueue(index)}></Button>
          <Button title="Prev" onPress={prev}></Button>
          <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePause}></Button>
          <Button title="Skip" onPress={skip}></Button>
        </View>
      </View>

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
