import { Album, Artist, Song } from '@choral/types';
import { db } from './client';
import { getArtist } from './artists';
import { getAlbum } from './albums';
import { getSong } from './songs';

interface RowResult {
  id: string;
  type: string;
}

interface MediaResults {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
}

export async function search(
  query: string,
  types: ('artist' | 'album' | 'song')[],
  limit?: number,
  offset?: number
): Promise<MediaResults | undefined> {
  if (types.length === 0) return undefined;

  const placeholders = types.map(() => '?').join(', '); // Fill out # of types to filter by to place temporary '?' in SQL query
  const limitClause = limit !== undefined ? `LIMIT ${limit} OFFSET ${offset ?? 0}` : '';

  const cleanQuery = query.trim(); // Remove excess white-space

  const fuzzyQuery = cleanQuery // Allows incomplete queries to work via prefix matching and avoid error on unclosed quotes
    .split(/\s+/) // Split query into individuals words
    .filter((word) => word.length > 0) // Remove empty string
    .map((term) => `"${term.replace(/"/g, '""')}"*`) // Wrap in quotes and escape any embeded quotes (e.g. query includes quotes)
    .join(' '); // Combine all modified words together

  let rows: RowResult[] = [];

  if (cleanQuery === '') {
    // Return all content of desired media types when query is empty
    rows = await db.getAllAsync<RowResult>(
      `SELECT * FROM media_search
        WHERE type in (${placeholders})
        ORDER BY name
        ${limitClause};`,
      types
    );
  } else {
    rows = await db.getAllAsync<RowResult>(
      `SELECT * FROM media_search 
        WHERE media_search MATCH ?
            AND type in (${placeholders}) 
        ORDER BY rank
        ${limitClause};`,
      [fuzzyQuery, ...types]
    );
  }

  // Support search for edgecases such as "&" by Pinegrove
  if (rows.length === 0 && cleanQuery.length <= 3) {
    rows = await db.getAllAsync<RowResult>(
      `SELECT * FROM media_search WHERE name = ? AND type IN (${placeholders});`,
      [cleanQuery, ...types]
    );
  }

  const media: MediaResults = {
    artists: [],
    albums: [],
    songs: [],
  };

  media.artists = rows
    .filter((row) => row.type === 'artist')
    .map((row) => getArtist(row.id))
    .filter((artist): artist is Artist => artist !== null);

  media.albums = rows
    .filter((row) => row.type === 'album')
    .map((row) => getAlbum(row.id))
    .filter((album): album is Album => album !== null);

  media.songs = rows
    .filter((row) => row.type === 'song')
    .map((row) => getSong(row.id))
    .filter((song): song is Song => song !== null);

  return media;
}
