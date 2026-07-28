import { db } from './client';

export async function getGenres(): Promise<string[]> {
  const rows: { name: string }[] = await db.getAllAsync('SELECT name FROM genres');
  return rows.map((row) => row.name);
}
