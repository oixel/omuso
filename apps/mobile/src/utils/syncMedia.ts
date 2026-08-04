import { isAlbum, isArtist, isSong, useAuth, useUpdatedMedia } from '@omuso/domain';
import { Album, Artist, Media, Song } from '@omuso/types';
import React, { useEffect } from 'react';

// Sync generalized Media type in component using its state setter
export function useSyncMedia<T extends Media>(
  setMedia: React.Dispatch<React.SetStateAction<T[]>>,
  isMedia: (item: Media) => item is T
) {
  const { client } = useAuth();
  const updatedMedia = useUpdatedMedia(client);

  useEffect(() => {
    if (!updatedMedia || !isMedia(updatedMedia)) return;

    setMedia((prev) => {
      const exists = prev.some((media) => media.id === updatedMedia.id);
      if (!exists) return prev;
      return prev.map((media) => (media.id === updatedMedia.id ? updatedMedia : media));
    });
  }, [updatedMedia, isMedia, setMedia]);
}

//
// Create wrappers for each Media type
//

export function useSyncArtists(setArtists: React.Dispatch<React.SetStateAction<Artist[]>>) {
  useSyncMedia(setArtists, isArtist);
}

export function useSyncAlbums(setAlbums: React.Dispatch<React.SetStateAction<Album[]>>) {
  useSyncMedia(setAlbums, isAlbum);
}

export function useSyncSongs(setSongs: React.Dispatch<React.SetStateAction<Song[]>>) {
  useSyncMedia(setSongs, isSong);
}
