import { Album } from '@choral/types';
import { db } from './client';

export function getAlbum(id: string): Album | null {
  return db.getFirstSync<Album>(`SELECT * from albums WHERE albums.id = ?;`, [id]);
}
