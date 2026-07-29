import { Media } from '@choral/types';
import { Pressable } from 'react-native';
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
  swipe_range: number;
  buttonCount: number;
}

export function ActionButton({
  item,
  translationX,
  swipe_range,
  buttonCount,
  Content,
  backgroundColor,
  onPress,
}: ActionButtonComponentProps): JSX.Element {
  return (
    <Pressable
      style={{
        backgroundColor: backgroundColor,
        width: swipe_range / buttonCount, // Ensure every button on this side has equal spacing
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
