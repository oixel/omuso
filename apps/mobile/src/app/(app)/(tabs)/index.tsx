import { View, Text, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, useAuth } from '@choral/domain';
import { useQueue, usePlayback } from '@choral/domain';
import { Play, Pause, SkipBack, SkipForward, ListX, Heart } from 'lucide-react-native';
import { clearDatabase, getArtist } from '@database';
import { sync } from '@database';
import { useEffect, useState } from 'react';
import { CoverArt } from '@/src/components';
import Slider from '@react-native-community/slider';

const Home = () => {
  const router = useRouter();
  const { logout, client } = useAuth();

  const { removeFromQueue, setQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);

  const { togglePause, restartOrPrev, skip, seekTo } = usePlayback();
  const isBuffering = usePlayback((state) => state.playbackState) === 'BUFFERING';
  const isPlaybackPlaying = usePlayback((state) => state.isPlaying); // Temporarily false while buffering
  const [isPlaying, setIsPlaying] = useState(false);

  const position = usePlayback((state) => state.position);
  const toMinutes = (ms: number) => Math.floor(ms / 1000 / 60);
  const toRemainingSeconds = (ms: number) => Math.floor((ms / 1000) % 60);
  const duration = usePlayback((state) => state.duration);

  const artistId = queue[index]?.artistId;
  const artist = artistId ? (getArtist(artistId)?.name ?? 'Unknown Artist') : 'Unknown Artist';

  useEffect(() => {
    if (!isBuffering) setIsPlaying(isPlaybackPlaying);
  }, [isPlaybackPlaying]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-shrink items-center justify-center w-full gap-2">
        <Text className="font-extrabold color-white text-5xl mb-12">choral</Text>
        <CoverArt
          style={{ height: '50%', aspectRatio: 1, borderRadius: 8 }}
          uri={queue[index]?.coverArtURL}
          recyclingKey={queue[index]?.id}
        />
        <Text className="text-xl font-bold color-white mt-5 self-start pl-10">
          {queue[index]?.title || 'No song'}
        </Text>
        <Text className="mb-2 font-medium text-xl self-start pl-10">{artist}</Text>
        <Slider
          disabled={!queue.length}
          style={{ width: '90%', height: 20 }}
          minimumTrackTintColor="white"
          maximumTrackTintColor="white"
          thumbTintColor="white"
          thumbSize={15}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={(newPosition) => seekTo(newPosition)}
        />
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 10,
            width: '80%',
            justifyContent: 'space-between',
          }}
        >
          <Text className="text-white justify-start">{`${toMinutes(position)}:${String(toRemainingSeconds(position)).padStart(2, '0')}`}</Text>
          <Text className="text-white justify-start">{`-${toMinutes(duration - position)}:${String(toRemainingSeconds(duration - position)).padStart(2, '0')}`}</Text>
        </View>
        <View className="flex flex-row gap-2">
          <Pressable
            onPress={() => removeFromQueue(index)}
            onLongPress={() => setQueue([])}
            disabled={!queue.length}
            style={{ opacity: !queue.length ? 0.5 : 1, marginRight: 20 }}
          >
            <ListX color="white" size={32} />
          </Pressable>
          <Pressable
            onPress={() => restartOrPrev(index)}
            disabled={!queue.length}
            style={{ opacity: !queue.length ? 0.5 : 1 }}
          >
            <SkipBack color="white" size={32} />
          </Pressable>
          <Pressable
            onPress={togglePause}
            disabled={!queue.length || isBuffering}
            style={{ opacity: !queue.length || isBuffering ? 0.5 : 1 }}
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
          <Pressable onPress={skip} disabled={true} style={{ opacity: 1, marginLeft: 20 }}>
            <Heart color="white" size={32} />
          </Pressable>
        </View>
      </View>

      {/* <Button
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
      <View className="mb-8"></View> */}
    </View>
  );
};

export default Home;
