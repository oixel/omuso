import { SongEntry } from '../SongEntry';
import { Plus, ListStart, ListEnd } from 'lucide-react-native';
import { isSong, useQueue } from '@choral/domain';
import * as Haptics from 'expo-haptics';
import { asSwipeable } from './asSwipeable';
import { ActionButton } from './ActionButton';

const PlusIcon = () => <Plus color="white" />;
const ListStartIcon = () => <ListStart color="white" />;
const ListEndIcon = () => <ListEnd color="white" />;

export const SwipeableSongEntry = asSwipeable(SongEntry, {
  getId: (props) => props.item.id,
  leftSoloSwipe: (props) => {
    const item = props?.item;
    if (item && isSong(item)) {
      console.log('TODO: Add to Playlist'); // TODO
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  leftContent: [
    (props) =>
      ActionButton({
        ...props,
        Content: PlusIcon,
        accessibilityLabel: 'Add song to playlist.',
        backgroundColor: '#8F4040',
      }),
  ],
  rightContent: [
    (props) =>
      ActionButton({
        ...props,
        Content: ListStartIcon,
        accessibilityLabel: 'Add song to play next in queue.',
        backgroundColor: '#74A667',
        onPress: (props) => {
          const item = props?.item;
          if (item && isSong(item)) useQueue.getState().addNext([item]);
        },
      }),
    (props) =>
      ActionButton({
        ...props,
        Content: ListEndIcon,
        accessibilityLabel: 'Add song to end of queue.',
        backgroundColor: '#7367A6',
        onPress: (props) => {
          const item = props?.item;
          if (item && isSong(item)) useQueue.getState().addToEnd([item]);
        },
      }),
  ],
  leftSwipeBackgroundColor: '#663A3A',
  rightSwipeBackgroundColor: '#5F8057',
});
