import { memo, useEffect } from 'react';
import { Dimensions, StyleProp, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  SharedValue,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

const { width } = Dimensions.get('window');

interface SwipeableProps<T extends object> {
  getId: (props: T) => string | number;
  leftSoloSwipe?: (props?: T) => void;
  rightSoloSwipe?: (props?: T) => void;
  leftContent?: React.FC<SwipeableContentProps<T>>[];
  rightContent?: React.FC<SwipeableContentProps<T>>[];
  swipeThreshold?: number;
  swipeIntent?: [number, number]; // How far user has to swipe before it starts panning
  backgroundColor?: string;
  leftSwipeBackgroundColor?: string;
  rightSwipeBackgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export interface SwipeableContentProps<T> {
  entryProps: T;
  translationX: SharedValue<number>;
  swipeThreshold: number;
}

export function asSwipeable<T extends object>( // Note: `extends object` is to avoid TS quirk of generic spread props since T is unconstrained
  Entry: React.FC<T>,
  {
    getId,
    leftSoloSwipe,
    rightSoloSwipe,
    leftContent,
    rightContent,
    swipeThreshold = 100,
    swipeIntent = [-20, 20],
    backgroundColor,
    leftSwipeBackgroundColor,
    rightSwipeBackgroundColor,
    style,
  }: SwipeableProps<T>
): React.NamedExoticComponent<T> {
  return memo(
    (props: T) => {
      const id = getId(props);
      const translationX = useSharedValue(0); // Tracks how far the entry has been swiped

      // Reset swipe status when entry gets recycled in FlashList
      useEffect(() => {
        translationX.value = 0;
      }, [id]);

      // Hide other side of buttons while swiping to avoid revealing them
      const leftContentOpacity = useAnimatedStyle(() => ({
        opacity: translationX.value > 0 ? 1 : 0,
      }));
      const rightContentOpacity = useAnimatedStyle(() => ({
        opacity: translationX.value < 0 ? 1 : 0,
      }));

      const dynamicBackgroundColor = useAnimatedStyle(() => ({
        backgroundColor:
          translationX.value > 0
            ? leftSwipeBackgroundColor
            : translationX.value < 0
              ? rightSwipeBackgroundColor
              : backgroundColor,
      }));

      const panGesture = Gesture.Pan()
        .activeOffsetX(swipeIntent) // Only pan on intent
        .onUpdate((event) => {
          // Update stored translation value to match current pan
          translationX.value = event.translationX;
        })
        .onEnd(() => {
          const canSwipeLeft = !!leftContent?.length && translationX.value > swipeThreshold;
          const canSwipeRight = !!rightContent?.length && translationX.value < -swipeThreshold;

          // Run defined action when only one element exists (e.g. add to playlist by swiping song left)
          if (canSwipeLeft && leftContent?.length === 1 && leftSoloSwipe) {
            runOnJS(leftSoloSwipe)(props);
            translationX.value = withSpring(width * 2);
            translationX.value = withDelay(250, withSpring(0)); // TODO: avoid hard code
            return;
          }
          if (canSwipeRight && rightContent?.length === 1 && rightSoloSwipe) {
            runOnJS(rightSoloSwipe)(props);
            translationX.value = withSpring(-width * 2);
            translationX.value = withDelay(250, withSpring(0));
            return;
          }

          // Otherwise, if multiple content exists on a side, hold the swipeable open to make a decision
          const springDirection = canSwipeLeft ? 1 : canSwipeRight ? -1 : 0;
          translationX.value = withSpring(springDirection * swipeThreshold);
        });

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }],
      }));

      return (
        <View style={{ overflow: 'hidden' }}>
          {/* Buttons hidden under swipeable entry */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                flexDirection: 'row',
              },
              style,
              dynamicBackgroundColor,
            ]}
          >
            <Animated.View
              style={[
                { flexDirection: 'row', alignItems: 'center', width: swipeThreshold },
                leftContentOpacity,
              ]}
            >
              {leftContent?.map((Content, i) => (
                <Content
                  key={'LeftSwipeableContent_' + i}
                  entryProps={props}
                  translationX={translationX}
                  swipeThreshold={swipeThreshold}
                />
              ))}
            </Animated.View>
            <View style={{ flex: 1 }}></View>
            <Animated.View
              style={[
                { flexDirection: 'row', alignItems: 'center', width: swipeThreshold },
                rightContentOpacity,
              ]}
            >
              {rightContent?.map((Content, i) => (
                <Content
                  key={'RightSwipeableContent_' + i}
                  entryProps={props}
                  translationX={translationX}
                  swipeThreshold={swipeThreshold}
                />
              ))}
            </Animated.View>
          </Animated.View>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>
              <Entry {...props} />
            </Animated.View>
          </GestureDetector>
        </View>
      );
    },
    (prev, next) => getId(prev) === getId(next)
  );
}
