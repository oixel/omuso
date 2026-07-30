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
        backgroundColor: '#8F4040',
      }),
  ],
  rightContent: [
    (props) =>
      ActionButton({
        ...props,
        Content: ListStartIcon,
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
        backgroundColor: '#7367A6',
        onPress: (props) => {
          const item = props?.item;
          if (item && isSong(item)) useQueue.getState().addToEnd([item]);
        },
      }),
  ],
  style: { backgroundColor: '#A2A1A6' },
});
