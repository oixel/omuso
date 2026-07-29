import { useQueue } from '@choral/domain';
import { Media, Song } from '@choral/types';
import { ListEnd, ListStart } from 'lucide-react-native';
import { memo, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const SWIPE_RANGE = 100; // How far right (+) or left (-) swipe must be before actions are shown

interface EntryProps {
  item: Media;
  horizontal: boolean;
}

function isSong(item: Media): item is Song {
  return (item as Song).title !== undefined;
}

export function asSwipeable(Entry: React.FC<EntryProps>): React.FC<EntryProps> {
  return memo(
    ({ item, horizontal }: EntryProps) => {
      const translationX = useSharedValue(0); // Tracks how far the entry has been swiped

      // Reset swipe status when entry gets recycled in FlashList
      useEffect(() => {
        translationX.value = 0;
      }, [item.id]);

      const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10]) // Intent range
        .onUpdate((event) => {
          // Update stored translation value to match current pan
          translationX.value = event.translationX;
        })
        .onEnd(() => {
          const springDirection =
            translationX.value < -SWIPE_RANGE ? -1 : translationX.value > SWIPE_RANGE ? 1 : 0;
          translationX.value = withSpring(springDirection * SWIPE_RANGE);
        });

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }],
      }));

      const { addNext, addToEnd } = useQueue();

      return (
        <View style={{ overflow: 'hidden' }}>
          {/* Buttons hidden under swipeable entry */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              backgroundColor: '#1d4ed8',
            }}
          >
            <Pressable
              style={{
                backgroundColor: '#3b82f6',
                width: SWIPE_RANGE / 2, // TODO: make dependent on button count
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderLeftWidth: 2,
                borderColor: '#1d4ed8',
              }}
              onPress={() => {
                translationX.value = withSpring(0);
                if (isSong(item)) addNext([item]);
              }}
            >
              <ListStart color={'white'} />
            </Pressable>
            <Pressable
              style={{
                backgroundColor: '#3b82f6',
                width: SWIPE_RANGE / 2,
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderLeftWidth: 2,
                borderColor: '#1d4ed8',
              }}
              onPress={() => {
                translationX.value = withSpring(0);
                if (isSong(item)) addToEnd([item]);
              }}
            >
              <ListEnd color={'white'} />
            </Pressable>
          </View>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>
              <Entry item={item} horizontal={horizontal} />
            </Animated.View>
          </GestureDetector>
        </View>
      );
    },
    (prev, next) => prev.item.id === next.item.id
  );
}
