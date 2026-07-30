import { useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { withSpring } from 'react-native-reanimated';
import { SwipeableContentProps } from './asSwipeable';
import * as Haptics from 'expo-haptics';

interface ActionButtonProps<T> extends SwipeableContentProps<T> {
  Content: React.FC;
  accessibilityLabel: string;
  onPress?: (props?: T) => void;
  backgroundColor: string;
  style?: StyleProp<ViewStyle>;
}

export function ActionButton<T>({
  entryProps,
  accessibilityLabel,
  translationX,
  Content,
  backgroundColor,
  style,
  onPress,
}: ActionButtonProps<T>) {
  return (
    <Pressable
      style={[styles.staticStyle, { backgroundColor: backgroundColor }, style]}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
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
