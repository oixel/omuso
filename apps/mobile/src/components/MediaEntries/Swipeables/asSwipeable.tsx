import { Media } from '@choral/types';
import { memo, useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ActionButton, ActionButtonProps } from './ActionButton';

interface EntryProps {
  item: Media;
  horizontal: boolean;
}

export function asSwipeable(
  Entry: React.FC<EntryProps>,
  leftButtons?: ActionButtonProps[],
  rightButtons?: ActionButtonProps[],
  swipeThreshold: number = 100,
  swipeIntent: [number, number] = [-20, 20] // How far user has to swipe before it starts panning
): React.FC<EntryProps> {
  return memo(
    ({ item, horizontal }: EntryProps) => {
      const translationX = useSharedValue(0); // Tracks how far the entry has been swiped

      // Reset swipe status when entry gets recycled in FlashList
      useEffect(() => {
        translationX.value = 0;
      }, [item.id]);

      const panGesture = Gesture.Pan()
        .activeOffsetX(swipeIntent) // Only pan on intent
        .onUpdate((event) => {
          // Update stored translation value to match current pan
          translationX.value = event.translationX;
        })
        .onEnd(() => {
          const canSwipeLeft = leftButtons?.length && translationX.value > swipeThreshold;
          const canSwipeRight = rightButtons?.length && translationX.value < -swipeThreshold;
          const springDirection = canSwipeLeft ? 1 : canSwipeRight ? -1 : 0;

          translationX.value = withSpring(springDirection * swipeThreshold);
        });

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }],
      }));

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
            {leftButtons?.map((buttonProps, i) => (
              <ActionButton
                key={'LeftActionButton_' + i}
                item={item}
                translationX={translationX}
                swipeThreshold={swipeThreshold}
                buttonCount={leftButtons.length}
                {...buttonProps}
              />
            ))}
            {rightButtons?.map((buttonProps, i) => (
              <ActionButton
                key={'RightActionButton_' + i}
                item={item}
                translationX={translationX}
                swipeThreshold={swipeThreshold}
                buttonCount={rightButtons.length}
                {...buttonProps}
              />
            ))}
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
