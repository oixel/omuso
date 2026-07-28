import { db } from './client';

export async function search(
  query: string,
  types: ('artist' | 'album' | 'song')[],
  limit?: number
) {
  if (types.length === 0) return [];

  const placeholders = types.map(() => '?').join(', '); // Fill out # of types to filter by to place temporary '?' in SQL query
  const limitClause = limit !== undefined ? `LIMIT ${limit}` : '';

  const result = await db.getAllAsync(
    `SELECT * FROM media_search 
        WHERE media_search MATCH ?
            AND type in (${placeholders}) 
        ORDER BY rank
        ${limitClause};`,
    [query, ...types]
  );

  return result;
}
