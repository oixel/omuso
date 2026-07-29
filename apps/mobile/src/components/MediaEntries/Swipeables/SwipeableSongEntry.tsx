import { asSwipeable } from './asSwipeable';
import { SongEntry } from '../SongEntry';
import { ListStart, ListEnd } from 'lucide-react-native';
import { isSong, useQueue } from '@choral/domain';

// Create swipeable SongEntry component
export const SwipeableSongEntry = asSwipeable(
  SongEntry,
  [],
  [
    {
      Content: () => <ListStart color="white" />,
      onPress: (item) => {
        if (!item) return;
        if (isSong(item)) useQueue.getState().addNext([item]);
      },
      backgroundColor: '#3b82f6',
    },
    {
      Content: () => <ListEnd color="white" />,
      onPress: (item) => {
        if (!item) return;
        if (isSong(item)) useQueue.getState().addToEnd([item]);
      },
      backgroundColor: '#3b82f6',
    },
  ]
);
