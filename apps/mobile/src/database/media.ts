import { SubsonicClient } from '@choral/api';
import { Media } from '@choral/types';
import { db } from './client';
import { isAlbum, isArtist } from '@choral/domain';

//
// Queries shared across media types
//

export async function toggleStarred(client: SubsonicClient, media: Media): Promise<boolean> {
  const table = isArtist(media) ? 'artists' : isAlbum(media) ? 'albums' : 'songs';

  const current = await db.getFirstAsync<{ starred: string | null }>(
    `SELECT starred FROM ${table} WHERE id = ?;`,
    [media.id]
  );

  const response = await client.toggleStarred(media, !!current?.starred);
  if (!response.success) return !!current?.starred;

  await db.runAsync(`UPDATE ${table} SET starred = ?, updated = ? WHERE ${table}.id = ?;`, [
    response.starred ?? null,
    Date.now(), // Track update time to uphold most recent starred state
    media.id,
  ]);

  return !current?.starred;
}
