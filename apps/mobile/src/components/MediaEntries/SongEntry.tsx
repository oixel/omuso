import { Media, Song } from '@choral/types';
import { Image } from 'expo-image';
import { Easing, Pressable, Text, View } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import ReanimatedSwipeable, {
  SwipeableMethods,
  SwipeDirection,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { memo, useRef } from 'react';
import { usePlayback, useQueue } from '@choral/domain';

function LeftAction(progress: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    return { transform: [{ translateX: drag.value - 80 }] };
  });

  return (
    <Animated.View
      style={[styleAnimation, { width: 80, justifyContent: 'center', alignItems: 'center' }]}
    >
      <Text className="font-bold color-white">Play next</Text>
    </Animated.View>
  );
}

function RightAction(progress: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    return { transform: [{ translateX: drag.value + TOTAL_RIGHT_WIDTH }] };
  });

  return (
    <Animated.View
      className="flex flex-row"
      style={[styleAnimation, { width: TOTAL_RIGHT_WIDTH, alignSelf: 'stretch' }]}
    >
      <Pressable
        style={({ pressed }) => [
          {
            width: BUTTON_WIDTH,
            flex: 1,
            backgroundColor: '#3262a8',
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
        onPress={() => {}}
      >
        <Text className="bold color-white">+ Next</Text>
      </Pressable>
      <Pressable
        style={{
          width: BUTTON_WIDTH,
          flex: 1,
          backgroundColor: '#8367cf',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {}}
      >
        <Text className="bold color-white">+ End</Text>
      </Pressable>
      {/* <Pressable
        style={{
          width: BUTTON_WIDTH,
          flex: 1,
          backgroundColor: '#86efac',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {}}
      >
        <Text className="bold color-white">3</Text>
      </Pressable> */}
    </Animated.View>
  );
}

const BUTTON_WIDTH = 50; // px
const RIGHT_BUTTON_COUNT = 3;
const TOTAL_RIGHT_WIDTH = BUTTON_WIDTH * RIGHT_BUTTON_COUNT;

// Type check to ensure passed-in Media item is a Song
function isSong(item: Media): item is Song {
  return (item as Song).title !== undefined;
}

interface SongEntryProps {
  item: Media;
}

const SongEntry: React.FC<SongEntryProps> = memo(
  ({ item }: SongEntryProps) => {
    if (!isSong(item)) return;

    const swipeableRef = useRef<SwipeableMethods>(null);

    const useTitleTicker = item.title.length > 35;
    const useArtistTicker = (item.artist?.length ?? 0) > 35;

    return (
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={2}
        overshootFriction={8}
        enableTrackpadTwoFingerGesture
        rightThreshold={30}
        renderRightActions={RightAction}
        renderLeftActions={LeftAction}
        onSwipeableWillOpen={(dir: SwipeDirection) => {
          if (dir === 'left') useQueue.getState().addToEnd([item]);
          else useQueue.getState().addNext([item]);

          // swipeableRef.current?.close();
        }}
      >
        <Pressable
          className="p-3 flex flex-row justify-start items-center max-h-20 gap-3 min-w-full"
          onPress={() => {
            useQueue.getState().setQueue([item]);
            usePlayback.getState().play();
          }}
        >
          <Image
            style={{ height: '100%', aspectRatio: 1 }}
            source={{ uri: item.coverArtURL }}
            contentFit="cover"
            recyclingKey={item.id}
            cachePolicy="memory-disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          <View className="border-b border-blue-500 flex-1 h-full">
            {useTitleTicker ? (
              <TextTicker
                scrollSpeed={25}
                marqueeDelay={1500}
                repeatSpacer={30}
                easing={Easing.linear}
                animationType="scroll"
                className="color-white font-medium text-xl"
              >
                {item.title || 'Untitled Song'}
              </TextTicker>
            ) : (
              <Text className="color-white font-medium text-xl">
                {item.title || 'Untitled Song'}
              </Text>
            )}
            {useArtistTicker ? (
              <TextTicker
                scrollSpeed={25}
                marqueeDelay={1500}
                repeatSpacer={30}
                easing={Easing.linear}
                animationType="scroll"
                style={{ lineHeight: 18, fontSize: 15 }}
                className="color-blue-200"
              >
                {item.artist || 'Unknown Artist'}
              </TextTicker>
            ) : (
              <Text className="color-blue-200"> {item.artist || 'Unknown Artist'}</Text>
            )}
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    );
  },
  (prev: SongEntryProps, next: SongEntryProps) => prev.item.id === next.item.id
);

export default SongEntry;
