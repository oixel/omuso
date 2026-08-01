import { isSong, useAuth, useUpdatedMedia } from '@omuso/domain';
import { Song } from '@omuso/types';
import { useEffect } from 'react';

// Syncs songs in component using its setSongs state setter
export function useSyncSongs(setSongs: React.Dispatch<React.SetStateAction<Song[]>>) {
  const { client } = useAuth();
  const updatedMedia = useUpdatedMedia(client);

  useEffect(() => {
    if (!updatedMedia || !isSong(updatedMedia)) return;
    setSongs((prev) => {
      const exists = prev.some((song) => song.id === updatedMedia.id);
      if (!exists) return prev;
      return prev.map((song) => (song.id === updatedMedia.id ? updatedMedia : song));
    });
  }, [updatedMedia]);
}
