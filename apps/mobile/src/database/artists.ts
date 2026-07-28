import { Artist } from '@choral/types';
import { db } from './client';

export function getArtist(id: string): Artist | null {
  return db.getFirstSync<Artist>(`SELECT * from artists WHERE artists.id = ?;`, [id]);
}
