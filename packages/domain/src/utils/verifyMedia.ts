import { Media, Artist, Album, Song } from '@omuso/types';

export function isArtist(item: Media): item is Artist {
  // Artist has overlapping properties with other Media types, so deduce whether it is not those
  return !isAlbum(item) && !isSong(item);
}

export function isAlbum(item: Media): item is Album {
  // Only Album has songCount
  return (item as Album).songCount !== undefined;
}

export function isSong(item: Media): item is Song {
  // Only Song has uri
  return (item as Song).uri !== undefined;
}
