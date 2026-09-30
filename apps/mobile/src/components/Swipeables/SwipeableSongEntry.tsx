import { SongEntry } from '../MediaEntries/SongEntry';
import { Plus, ListStart, ListEnd } from 'lucide-react-native';
import { isSong, useQueue } from '@omuso/domain';
import * as Haptics from 'expo-haptics';
import { asSwipeable } from './asSwipeable';
import { ActionButton } from './ActionButton';
import { MediaListEntryProps } from '../MediaEntries/MediaListEntry';
import { Media } from '@omuso/types';

const PlusIcon = () => <Plus color="white" />;
const ListStartIcon = () => <ListStart color="white" />;
const ListEndIcon = () => <ListEnd color="white" />;

export const SwipeableSongEntry = (
  showIsPlaying: boolean = false,
  showTrackNumber: boolean = false,
  showAlbumCover: boolean = true,
  showSongLabel: boolean = false,
  showArtist: boolean = true,
  onPress?: (media: Media) => void
) => {
  const AlteredSongEntry: React.FC<MediaListEntryProps> = (props) => (
    <SongEntry
      {...props}
      showIsPlaying={showIsPlaying}
      showTrackNumber={showTrackNumber}
      showAlbumCover={showAlbumCover}
      showSongLabel={showSongLabel}
      showArtist={showArtist}
      onPress={onPress}
    />
  );
  return asSwipeable(AlteredSongEntry, {
    getId: (props) => props.item.id,
    leftSoloSwipe: (props) => {
      const item = props?.item;
      if (item && isSong(item)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    leftContent: [
      (props) =>
        ActionButton({
          ...props,
          Content: PlusIcon,
          accessibilityLabel: 'Toggle starred status of song.',
          backgroundColor: '#dab978',
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
    leftSwipeBackgroundColor: '#ae9268',
    rightSwipeBackgroundColor: '#5F8057',
  });
};
