import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  cancelAnimation,
  SharedValue,
  withSequence,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

interface SwipeableProps<T extends object> {
  getId: (props: T) => string | number;
  leftSoloSwipe?: (props?: T) => void;
  rightSoloSwipe?: (props?: T) => void;
  soloSwipeHoldDelay?: number; // How long it takes before solo-swipe animations resets (milliseconds)
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

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' },
  content: { flexDirection: 'row', alignItems: 'center' },
  divider: { flex: 1 },
});

// Ensure entry is not the same
const shallowCompare = (a: object, b: object) => {
  const aKeys = Object.keys(a) as (keyof typeof a)[]; // Weird typing to allow indexing of a
  const bKeys = Object.keys(b);
  return aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key]);
};

export function asSwipeable<T extends object>( // Note: `extends object` is to avoid TS quirk of generic spread props since T is unconstrained
  Entry: React.FC<T>,
  {
    getId,
    leftSoloSwipe,
    rightSoloSwipe,
    soloSwipeHoldDelay = 150,
    leftContent,
    rightContent,
    swipeThreshold = 100,
    swipeIntent = [-30, 30],
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
      const [hasInteracted, setHasInteracted] = useState(false);

      const width = useWindowDimensions().width;

      useLayoutEffect(() => {
        cancelAnimation(translationX);
        translationX.value = 0;
      }, [id]);

      const dynamicBackgroundColor = useAnimatedStyle(() => {
        const isLeft = translationX.value > 0;
        const isRight = translationX.value < 0;
        return {
          backgroundColor: isLeft
            ? leftSwipeBackgroundColor
            : isRight
              ? rightSwipeBackgroundColor
              : backgroundColor,
        };
      });

      // Hide other side of buttons while swiping to avoid revealing them
      const leftContentOpacity = useAnimatedStyle(() => ({
        opacity: translationX.value > 0 ? 1 : 0,
      }));
      const rightContentOpacity = useAnimatedStyle(() => ({
        opacity: translationX.value < 0 ? 1 : 0,
      }));

      // Keep props fresh
      const propsRef = useRef(props);
      propsRef.current = props;
      const fireLeftSoloSwipe = useCallback(
        () => leftSoloSwipe?.(propsRef.current),
        [leftSoloSwipe]
      );
      const fireRightSoloSwipe = useCallback(
        () => rightSoloSwipe?.(propsRef.current),
        [rightSoloSwipe]
      );

      const panGesture = useMemo(
        () =>
          Gesture.Pan()
            .activeOffsetX(swipeIntent) // Only pan on intent
            .onStart(() => {
              runOnJS(setHasInteracted)(true);
            })
            .onUpdate((event) => {
              // Update stored translation value to match current pan
              translationX.value = event.translationX;
            })
            .onEnd(() => {
              const canSwipeLeft = !!leftContent?.length && translationX.value > swipeThreshold;
              const canSwipeRight = !!rightContent?.length && translationX.value < -swipeThreshold;

              // Run defined action when only one element exists (e.g. add to playlist by swiping song left)
              if (canSwipeLeft && leftContent?.length === 1 && leftSoloSwipe) {
                runOnJS(fireLeftSoloSwipe)();
                translationX.value = withSequence(
                  withSpring(width * 2),
                  withDelay(soloSwipeHoldDelay, withSpring(0))
                );
                return;
              }
              if (canSwipeRight && rightContent?.length === 1 && rightSoloSwipe) {
                runOnJS(fireRightSoloSwipe)();
                translationX.value = withSequence(
                  withSpring(-width * 2),
                  withDelay(soloSwipeHoldDelay, withSpring(0))
                );
                return;
              }

              // Otherwise, if multiple content exists on a side, hold the swipeable open to make a decision
              const springDirection = canSwipeLeft ? 1 : canSwipeRight ? -1 : 0;
              translationX.value = withSpring(springDirection * swipeThreshold);
            }),
        [id, width, swipeThreshold, leftContent, rightContent, leftSoloSwipe, rightSoloSwipe]
      );

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translationX.value }],
      }));

      return (
        <View style={{ overflow: 'hidden' }}>
          {/* Buttons hidden under swipeable entry */}
          <Animated.View style={[styles.container, style, dynamicBackgroundColor]}>
            <Animated.View style={[styles.content, { width: swipeThreshold }, leftContentOpacity]}>
              {/* Only render left buttons when user starts swiping */}
              {hasInteracted &&
                leftContent?.map((Content, i) => (
                  <Content
                    key={'LeftSwipeableContent_' + i}
                    entryProps={props}
                    translationX={translationX}
                    swipeThreshold={swipeThreshold}
                  />
                ))}
            </Animated.View>
            <View style={styles.divider}></View>
            <Animated.View style={[styles.content, { width: swipeThreshold }, rightContentOpacity]}>
              {/* Onl render right buttons when user starts swiping */}
              {hasInteracted &&
                rightContent?.map((Content, i) => (
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
    (prev, next) => getId(prev) === getId(next) && shallowCompare(prev, next)
  );
}
