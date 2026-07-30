import { Media } from '@choral/types';
import { useMemo } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SharedValue, withSpring } from 'react-native-reanimated';
import { JSX } from 'react/jsx-runtime';

export interface ActionButtonProps {
  Content: React.FC;
  onPress: (item?: Media) => void;
  backgroundColor: string;
}

interface ActionButtonComponentProps extends ActionButtonProps {
  item: Media;
  translationX: SharedValue<number>;
  swipeThreshold: number;
  buttonCount: number;
  style?: StyleProp<ViewStyle>;
}

export function ActionButton({
  item,
  translationX,
  swipeThreshold,
  buttonCount,
  Content,
  backgroundColor,
  style,
  onPress,
}: ActionButtonComponentProps): JSX.Element {
  // Minor performance improvement, only update styling if styling has changed
  const activeStyle = useMemo(
    () => [
      styles.staticStyle,
      {
        backgroundColor: backgroundColor,
        width: swipeThreshold / buttonCount, // Ensure every button on this side has equal spacing
      },
      { ...style },
    ],
    [backgroundColor, swipeThreshold, buttonCount]
  );

  return (
    <Pressable
      style={activeStyle}
      onPress={() => {
        onPress(item);
        translationX.value = withSpring(0);
      }}
    >
      <Content />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  staticStyle: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#1d4ed8',
  },
});
