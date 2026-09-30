import { Media } from '@omuso/types';

export type MediaListEntryProps = {
  item: Media;
  isBigEntry: boolean;
  onPress?: (media: Media) => void;
};
