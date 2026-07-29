import { View, Text, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { useQueue, usePlayback } from '@choral/domain';
import { Image } from 'expo-image';
import { Play, Pause, SkipBack, SkipForward, ListX } from 'lucide-react-native';
import { clearDatabase, getArtist } from '@database';
import { sync } from '@database';
import { useEffect, useState } from 'react';

const Home = () => {
  const router = useRouter();
  const { logout, client } = useAuth();

  const { removeFromQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);
  const { togglePause, prev, skip, getPlaybackState } = usePlayback();

  const playbackIsPlaying = usePlayback((state) => state.isPlaying); // Temporarily false while buffering
  const [isPlaying, setIsPlaying] = useState(false);

  const artistId = queue[index]?.artistId;
  const artist = artistId ? (getArtist(artistId)?.name ?? 'Unknown Artist') : 'Unknown Artist';

  useEffect(() => {
    // Only update isPlaying state when status actually changes, not while buffering during song transition
    (async () => {
      const playbackState = await getPlaybackState();
      if (playbackState !== 'BUFFERING') setIsPlaying(playbackIsPlaying);
    })();
  }, [playbackIsPlaying]);

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
          <Pressable
            onPress={() => removeFromQueue(index)}
            disabled={!queue.length}
            style={{ opacity: !queue.length ? 0.5 : 1 }}
          >
            <ListX color="white" size={32} />
          </Pressable>
          <Pressable
            onPress={prev}
            disabled={index === 0}
            style={{ opacity: index === 0 ? 0.5 : 1 }}
          >
            <SkipBack color="white" size={32} />
          </Pressable>
          <Pressable
            onPress={togglePause}
            disabled={!queue.length}
            style={{ opacity: !queue.length ? 0.5 : 1 }}
          >
            {isPlaying ? <Pause color="white" size={32} /> : <Play color="white" size={32} />}
          </Pressable>
          <Pressable
            onPress={skip}
            disabled={index === queue.length - 1 || !queue.length}
            style={{ opacity: index === queue.length - 1 || !queue.length ? 0.5 : 1 }}
          >
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
