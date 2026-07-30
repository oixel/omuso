import { asSwipeable } from './asSwipeable';
import { SongEntry } from '../SongEntry';
import { Plus, ListStart, ListEnd } from 'lucide-react-native';
import { isSong, useQueue } from '@choral/domain';
import * as Haptics from 'expo-haptics';

// Create swipeable SongEntry component
export const SwipeableSongEntry = asSwipeable(
  SongEntry,
  [
    {
      Content: () => <Plus color="white" />,
      onPress: (item) => {
        if (item && isSong(item)) {
          console.log('TODO: Add to Playlist'); // TODO
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      backgroundColor: '#3b82f6',
    },
  ],
  [
    {
      Content: () => <ListStart color="white" />,
      onPress: (item) => {
        if (item && isSong(item)) {
          useQueue.getState().addNext([item]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      backgroundColor: '#3b82f6',
    },
    {
      Content: () => <ListEnd color="white" />,
      onPress: (item) => {
        if (item && isSong(item)) {
          useQueue.getState().addToEnd([item]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
      backgroundColor: '#3b82f6',
    },
  ]
);
