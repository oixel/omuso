import { Media, Song } from '@choral/types';

export function isSong(item: Media): item is Song {
  return (item as Song).title !== undefined;
}
