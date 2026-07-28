import { db } from './client';

export async function createSchema() {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync('PRAGMA busy_timeout = 3000;');

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
        created TEXT NOT NULL,
        artistId TEXT,
        coverArt TEXT,
        coverArtURL TEXT,
        FOREIGN KEY(artistId) REFERENCES artists(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_albums_artistId ON albums(artistId);

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
    CREATE INDEX IF NOT EXISTS idx_songs_artistId ON songs(artistId);
    CREATE INDEX IF NOT EXISTS idx_songs_albumId ON songs(albumId);

    CREATE TABLE IF NOT EXISTS genres (
      name TEXT PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS album_genres (
      albumId TEXT NOT NULL,
      genre TEXT NOT NULL,
      FOREIGN KEY(albumId) REFERENCES albums(id) ON DELETE CASCADE,
      FOREIGN KEY(genre) REFERENCES genres(name) ON DELETE CASCADE,
      PRIMARY KEY(albumId, genre)
    ) WITHOUT ROWID;
    CREATE INDEX IF NOT EXISTS idx_album_genres_genre ON album_genres(genre);

    CREATE TABLE IF NOT EXISTS song_genres (
      songId TEXT NOT NULL,
      genre TEXT NOT NULL,
      FOREIGN KEY(songId) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY(genre) REFERENCES genres(name) ON DELETE CASCADE,
      PRIMARY KEY(songId, genre)
    ) WITHOUT ROWID;
    CREATE INDEX IF NOT EXISTS idx_song_genres_genre ON song_genres(genre);
  `);
}

export async function clearDatabase() {
  await db.execAsync(`
    DELETE FROM album_genres;
    DELETE FROM song_genres;
    DELETE FROM genres;
    DELETE FROM songs;
    DELETE FROM albums;
    DELETE FROM artists;
  `);

  console.log('Database wiped!');
}
