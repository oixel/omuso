import { db } from './client';
import { SubsonicClient } from '@choral/api';
import { Album, Artist, Song } from '@choral/types';

// Upsert all data from SubsonicClient into local SQLite DB and prune removed media
export async function sync(client: SubsonicClient) {
  const PAGE_SIZE = 500;

  const artists: Artist[] = [];
  const albums: Album[] = [];
  const songs: Song[] = [];

  let artistPage = 0;
  while (true) {
    const result = await client.search({
      artistCount: PAGE_SIZE,
      albumCount: 0,
      songCount: 0,
      artistOffset: artistPage * PAGE_SIZE,
    });

    if (result.artists) artists.push(...result.artists);

    if (!result?.artists?.length || result.artists.length < PAGE_SIZE) break;

    artistPage++;
  }

  let albumPage = 0;
  while (true) {
    const result = await client.search({
      artistCount: 0,
      albumCount: PAGE_SIZE,
      songCount: 0,
      albumOffset: albumPage * PAGE_SIZE,
    });

    if (result.albums) albums.push(...result.albums);

    if (!result?.albums?.length || result.albums.length < PAGE_SIZE) break;

    albumPage++;
  }

  let songPage = 0;
  while (true) {
    const result = await client.search({
      artistCount: 0,
      albumCount: 0,
      songCount: PAGE_SIZE,
      songOffset: songPage * PAGE_SIZE,
    });

    if (result.songs) songs.push(...result.songs);

    if (!result?.songs?.length || result.songs.length < PAGE_SIZE) break;

    songPage++;
  }

  await db.withTransactionAsync(async () => {
    // Create temporary tables for pruning removed data
    await db.execAsync(`
        DROP TABLE IF EXISTS seen_artists;
        DROP TABLE IF EXISTS seen_albums;
        DROP TABLE IF EXISTS seen_songs;
        CREATE TEMP TABLE seen_artists (id TEXT PRIMARY KEY NOT NULL);
        CREATE TEMP TABLE seen_albums (id TEXT PRIMARY KEY NOT NULL);
        CREATE TEMP TABLE seen_songs (id TEXT PRIMARY KEY NOT NULL);
    `);

    for (const artist of artists) {
      await db.runAsync(
        `INSERT INTO artists(id, name, coverArt, coverArtURL) VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name=excluded.name, coverArt=excluded.coverArt, coverArtURL=excluded.coverArtURL`,
        [artist.id, artist.name, artist.coverArt ?? null, artist.coverArtURL ?? null]
      );

      await db.runAsync(`INSERT INTO seen_artists(id) VALUES (?)`, [artist.id]);
    }

    for (const album of albums) {
      await db.runAsync(
        `INSERT INTO albums(id, name, songCount, duration, created, artistId, coverArt, coverArtURL) VALUES(?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name=excluded.name, songCount=excluded.songCount, duration=excluded.duration, created=excluded.created, artistId=excluded.artistId, coverArt=excluded.coverArt, coverArtURL=excluded.coverArtURL`,
        [
          album.id,
          album.name,
          album.songCount,
          album.duration,
          album.created,
          album.artistId ?? null,
          album.coverArt ?? null,
          album.coverArtURL ?? null,
        ]
      );

      await db.runAsync(`INSERT INTO seen_albums(id) VALUES (?)`, [album.id]);
    }

    for (const song of songs) {
      await db.runAsync(
        `INSERT INTO songs(id, title, uri, artistId, albumId, coverArt, coverArtURL) VALUES(?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET title=excluded.title, uri=excluded.uri, artistId=excluded.artistId, albumId=excluded.albumId, coverArt=excluded.coverArt, coverArtURL=excluded.coverArtURL`,
        [
          song.id,
          song.title,
          song.uri,
          song.artistId ?? null,
          song.albumId ?? null,
          song.coverArt ?? null,
          song.coverArtURL ?? null,
        ]
      );

      await db.runAsync(`INSERT INTO seen_songs(id) VALUES (?)`, [song.id]);
    }

    // Prune any media that no longer exists in the database
    await db.execAsync(`
        DELETE FROM artists WHERE id NOT IN (SELECT id from seen_artists);
        DELETE FROM albums WHERE id NOT IN (SELECT id from seen_albums);
        DELETE FROM songs WHERE id NOT IN (SELECT id from seen_songs);
    `);
  });
}
