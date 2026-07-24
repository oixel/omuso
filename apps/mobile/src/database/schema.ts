import { db } from './client';

export async function createSchema() {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS artists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        coverArt TEXT,
        coverArtURL TEXT
    );

    CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        songCount INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        created DATE NOT NULL,
        artistId TEXT,
        coverArt TEXT,
        coverArtURL TEXT,
        FOREIGN KEY(artistId) REFERENCES artists(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY NOT NULL, 
        title TEXT NOT NULL, 
        uri TEXT NOT NULL, 
        artistId TEXT,
        albumId TEXT,
        coverArt TEXT,
        coverArtURL TEXT,
        FOREIGN KEY(artistId) REFERENCES artists(id) ON DELETE SET NULL,
        FOREIGN KEY(albumId) REFERENCES albums(id) ON DELETE SET NULL
    );
  `);
}
