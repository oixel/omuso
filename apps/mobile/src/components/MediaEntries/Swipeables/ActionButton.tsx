import { useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { withSpring } from 'react-native-reanimated';
import { SwipeableContentProps } from './asSwipeable';
import * as Haptics from 'expo-haptics';

interface ActionButtonProps<T> extends SwipeableContentProps<T> {
  Content: React.FC;
  onPress?: (props?: T) => void;
  backgroundColor: string;
  style?: StyleProp<ViewStyle>;
}

export function ActionButton<T>({
  entryProps,
  translationX,
  Content,
  backgroundColor,
  style,
  onPress,
}: ActionButtonProps<T>) {
  // Minor performance improvement, only update styling if styling has changed
  const activeStyle = useMemo(
    () => [styles.staticStyle, { backgroundColor: backgroundColor }, style],
    [backgroundColor, style]
  );

  return (
    <Pressable
      style={activeStyle}
      disabled={!onPress}
      onPress={() => {
        if (!onPress) return;
        onPress(entryProps);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        translationX.value = withSpring(0);
      }}
    >
      <Content />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  staticStyle: {
    flex: 1,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#1d4ed8',
  },
});
