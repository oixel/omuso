import { Button, Text, View } from 'react-native';
import { usePlayback } from '@choral/domain';

import { useEffect, useState } from 'react';

import { Asset } from 'expo-asset';
import { Track } from '@choral/types';
import { useQueue } from '@choral/domain';
import NativeAudioPlayerModule from 'native-audio-player';
import { useRouter } from 'expo-router';

const Testing = () => {
  const { togglePause, prev, skip, seekTo } = usePlayback();
  const isPlaying = usePlayback((state) => state.isPlaying);

  const { updateQueue, addToEnd, addNext, removeFromQueue } = useQueue();
  const index = useQueue((state) => state.index);
  const queue = useQueue((state) => state.queue);

  const [theFeeling, setTheFeeling] = useState<Track>();
  const [cannonball, setCannonball] = useState<Track>();

  async function loadSongs() {
    // TODO: Remove (only for initial debugging)
    // Loads MP3 file into an asset to be usable within the app instance
    const theFeelingAsset = await Asset.fromModule(
      require('../../../assets/the-feeling.mp3')
    ).downloadAsync();

    const theFeelingTrack: Track = {
      id: 'the-feeling-track-id',
      uri: theFeelingAsset.localUri as string,
      title: 'The Feeling',
      artist: 'Steve Lacy',
      album: 'Oh yeah?',
    };

    const cannonballAsset = await Asset.fromModule(
      require('../../../assets/cannonball.mp3')
    ).downloadAsync();

    const cannonballTrack: Track = {
      id: 'cannonball-track-id',
      uri: cannonballAsset.localUri as string,
      title: 'Cannonball!',
      artist: 'Buck Meek',
      album: 'Buck Meek',
    };

    setTheFeeling(theFeelingTrack);
    setCannonball(cannonballTrack);
  }

  useEffect(() => {
    loadSongs();
  }, []);

  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white gap-2">
      <Text className="text-xl font-bold text-blue-500">Welcome to Choral!</Text>
      <Text className="text-xl font-bold text-blue-500 my-5">
        Current Track: {queue[index]?.track.title}
      </Text>

      <Button title="<-- Back" onPress={router.back}></Button>

      <Text className="text-xl font-bold my-5">Playback Testing:</Text>
      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePause}></Button>
      <Button title="Prev" onPress={prev}></Button>
      <Button title="Skip" onPress={skip}></Button>

      <Text className="text-xl font-bold my-5">Queue Testing:</Text>
      <Button
        title='Add "The Feeling" to end'
        onPress={() => addToEnd([theFeeling as Track])}
      ></Button>
      <Button
        title='Add "The Feeling" next'
        onPress={() => addNext([theFeeling as Track])}
      ></Button>
      <Button
        title='Add "Cannonball" to end'
        onPress={() => addToEnd([cannonball as Track])}
      ></Button>
      <Button title='Add "Cannonball" next' onPress={() => addNext([cannonball as Track])}></Button>
      <Button
        title="Output Queue"
        onPress={() => {
          console.log(queue.map((queuedTrack) => queuedTrack.track.title));
        }}
      ></Button>
      <Button title="Remove First Song" onPress={() => removeFromQueue(0)}></Button>
      <Button title="Remove Current Song" onPress={() => removeFromQueue(index)}></Button>
      <Button
        title="Force Wipe ExoPlayer (for testing restore)"
        onPress={() => NativeAudioPlayerModule.removeFromQueue(0, queue.length)}
      ></Button>
      <Button title="Update Queue" onPress={() => updateQueue([])}></Button>
    </View>
  );
};

export default Testing;
