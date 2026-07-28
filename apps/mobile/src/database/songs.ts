import { Song } from '@choral/types';
import { db } from './client';

export function getSong(id: string): Song | null {
  return db.getFirstSync<Song>(`SELECT * from songs WHERE songs.id = ?;`, [id]);
}

export async function getSongsByGenre(genre: string): Promise<Song[]> {
  const songs = await db.getAllAsync<Song>(
    `SELECT * FROM songs
        JOIN song_genres ON song_genres.songId = songs.id
        WHERE song_genres.genre = ?;`,
    [genre]
  );

  return songs;
}
