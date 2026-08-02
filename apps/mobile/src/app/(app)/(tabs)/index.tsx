import { View, Text, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { destroyAudioPlayer, msToTime, useAuth } from '@omuso/domain';
import { useQueue, usePlayback } from '@omuso/domain';
import { Play, Pause, SkipBack, SkipForward, ListX, Star } from 'lucide-react-native';
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
  const [slidePosition, setSlidePosition] = useState<number | null>(null);
  const duration = usePlayback((state) => state.duration);

  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (!isBuffering) setIsPlaying(isPlaybackPlaying);
  }, [isPlaybackPlaying]);

  // Update star icon when a new song enters playback
  useEffect(() => {
    if (queue[index]) setStarred(!!queue[index].starred);
  }, [index, queue]);

  // Wipe slidePosition when the player properly seeks to new position
  useEffect(() => {
    if (slidePosition) setSlidePosition(null);
  }, [position]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-shrink items-center justify-center w-full gap-2">
        <Text className="font-extrabold color-white text-5xl mb-12">omuso</Text>
        <CoverArt
          style={{ height: '50%', aspectRatio: 1, borderRadius: 8 }}
          uri={queue[index]?.coverArtURL}
          recyclingKey={queue[index]?.id}
        />

        <Text
          onPress={() => {
            if (!client || !queue.length || !queue[index].albumId) return;
            router.navigate({
              pathname: '/album/[albumId]',
              params: { albumId: queue[index].albumId },
            });
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-xl font-bold color-white mt-5 self-start px-10"
        >
          {queue[index]?.title ?? (queue.length ? 'Unknown song' : 'No song')}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="mb-2 font-medium text-xl self-start pl-10 color-blue-100"
        >
          {queue[index]?.artist ?? (queue.length ? 'Unknown artist' : 'No artist')}
        </Text>
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
          onValueChange={(newPosition) => setSlidePosition(newPosition)}
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
          <Text className="text-white justify-start">
            {slidePosition ? msToTime(slidePosition) : msToTime(queue.length ? position : 0)}
          </Text>
          <Text className="text-white justify-start">
            {'-' +
              (slidePosition ? msToTime(duration - slidePosition) : msToTime(duration - position))}
          </Text>
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
          <Pressable
            onPress={async () => {
              setStarred(!starred); // Toggle star excitedly
              const newStatus = (await client?.toggleStarred(queue[index], starred))?.starred;
              setStarred(!!newStatus);
            }}
            disabled={!queue.length || !queue[index]}
            style={{ opacity: !queue.length || !queue[index] ? 0.5 : 1, marginLeft: 20 }}
          >
            <Star color="white" fill={starred ? 'white' : 'none'} size={32} />
          </Pressable>
        </View>
      </View>

      {/* 
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
