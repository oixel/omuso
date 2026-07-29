import { Media } from '@choral/types';
import { JSX, memo, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';

const SWIPE_RANGE = 100; // How far right (+) or left (-) swipe must be before actions are shown

interface EntryProps {
  item: Media;
  horizontal: boolean;
}

interface ActionButtonProps {
  Content: React.FC;
  onPress: (item?: Media) => void;
  backgroundColor: string;
}

interface ActionButtonComponentProps extends ActionButtonProps {
  item: Media;
  translationX: SharedValue<number>;
  buttonCount: number;
}

function ActionButton({
  item,
  translationX,
  buttonCount,
  Content,
  backgroundColor,
  onPress,
}: ActionButtonComponentProps): JSX.Element {
  return (
    <Pressable
      style={{
        backgroundColor: backgroundColor,
        width: SWIPE_RANGE / buttonCount, // Ensure every button on this side has equal spacing
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 2,
        borderColor: '#1d4ed8',
      }}
      onPress={() => {
        onPress(item);
        translationX.value = withSpring(0);
      }}
    >
      <Content />
    </Pressable>
  );
}

export function asSwipeable(
  Entry: React.FC<EntryProps>,
  leftButtons?: ActionButtonProps[],
  rightButtons?: ActionButtonProps[]
): React.FC<EntryProps> {
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
                buttonCount={leftButtons.length}
                {...buttonProps}
              />
            ))}
            {rightButtons?.map((buttonProps, i) => (
              <ActionButton
                key={'RightActionButton_' + i}
                item={item}
                translationX={translationX}
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
