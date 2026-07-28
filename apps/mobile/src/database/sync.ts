import { db } from './client';
import { SubsonicClient } from '@choral/api';
import { Album, Artist, Song } from '@choral/types';

// Helper function to fill out genre join tables
async function fillGenres(media: Album | Song, label: 'album' | 'song') {
  if (media.genres !== undefined) {
    for (const genre of media.genres) {
      await db.runAsync(
        `INSERT INTO genres(name) VALUES(?) 
          ON CONFLICT(name) DO UPDATE SET name=excluded.name;`,
        genre
      );

      await db.runAsync(
        `INSERT INTO ${label}_genres(${label}Id, genre) VALUES(?, ?)
          ON CONFLICT(${label}Id, genre) DO UPDATE SET ${label}Id=excluded.${label}Id, genre=excluded.genre;`,
        media.id,
        genre
      );

      await db.runAsync(`INSERT INTO seen_genres(name) VALUES(?)`, genre);
    }
  }
}

const PAGE_SIZE = 500;

async function fetchAllArtists(client: SubsonicClient): Promise<Artist[]> {
  let artistPage = 0;
  const artists: Artist[] = [];

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

  return artists;
}

async function fetchAllAlbums(client: SubsonicClient): Promise<Album[]> {
  let albumPage = 0;
  const albums: Album[] = [];

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

  return albums;
}

async function fetchAllSongs(client: SubsonicClient): Promise<Song[]> {
  let songPage = 0;
  const songs = [];

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

  return songs;
}

// Upsert all data from SubsonicClient into local SQLite DB and prune removed media
export async function sync(client: SubsonicClient) {
  const [artists, albums, songs] = await Promise.all([
    fetchAllArtists(client),
    fetchAllAlbums(client),
    fetchAllSongs(client),
  ]);

  // Upsert all received media data from server to local SQL database in on atomic operation
  await db.withTransactionAsync(async () => {
    // Create temporary tables for pruning removed data
    await db.execAsync(`
        DROP TABLE IF EXISTS seen_artists;
        DROP TABLE IF EXISTS seen_albums;
        DROP TABLE IF EXISTS seen_songs;
        DROP TABLE IF EXISTS seen_genres;
        CREATE TEMP TABLE seen_artists (id TEXT PRIMARY KEY NOT NULL);
        CREATE TEMP TABLE seen_albums (id TEXT PRIMARY KEY NOT NULL);
        CREATE TEMP TABLE seen_songs (id TEXT PRIMARY KEY NOT NULL);
        CREATE TEMP TABLE seen_genres (name TEXT NOT NULL);
    `);

    // Prepare SQL statements once to avoid expo-sqlite parsing and recompiling on every loop
    const upsertArtist = await db.prepareAsync(`
      INSERT INTO artists(id, name, coverArt, coverArtURL) VALUES ($id, $name, $coverArt, $coverArtURL)
        ON CONFLICT(id) DO UPDATE SET 
        name=excluded.name, coverArt=excluded.coverArt, coverArtURL=excluded.coverArtURL;
    `);
    const insertSeenArtist = await db.prepareAsync(`INSERT INTO seen_artists(id) VALUES ($id);`);

    for (const artist of artists) {
      await upsertArtist.executeAsync({
        $id: artist.id,
        $name: artist.name,
        $coverArt: artist.coverArt ?? null,
        $coverArtURL: artist.coverArtURL ?? null,
      });

      await insertSeenArtist.executeAsync({ $id: artist.id });
    }

    console.log(`${artists.length} artists synced!`);

    const upsertAlbum = await db.prepareAsync(`
      INSERT INTO albums(id, name, songCount, duration, created, artistId, coverArt, coverArtURL) 
        VALUES($id, $name, $songCount, $duration, $created, $artistId, $coverArt, $coverArtURL)
        ON CONFLICT(id) DO UPDATE SET 
          name=excluded.name, 
          songCount=excluded.songCount, 
          duration=excluded.duration, 
          created=excluded.created, 
          artistId=excluded.artistId, 
          coverArt=excluded.coverArt, 
          coverArtURL=excluded.coverArtURL;
    `);
    const insertSeenAlbum = await db.prepareSync(`INSERT INTO seen_albums(id) VALUES ($id);`);

    for (const album of albums) {
      await upsertAlbum.executeAsync({
        $id: album.id,
        $name: album.name,
        $songCount: album.songCount,
        $duration: album.duration,
        $created: album.created,
        $artistId: album.artistId ?? null,
        $coverArt: album.coverArt ?? null,
        $coverArtURL: album.coverArtURL ?? null,
      });

      await insertSeenAlbum.executeAsync({ $id: album.id });

      await fillGenres(album, 'album');
    }

    console.log(`${albums.length} albums synced!`);

    const upsertSong = await db.prepareAsync(`
      INSERT INTO songs(id, title, uri, artistId, albumId, coverArt, coverArtURL) 
      VALUES($id, $title, $uri, $artistId, $albumId, $coverArt, $coverArtURL)
      ON CONFLICT(id) DO UPDATE SET 
        title=excluded.title, 
        uri=excluded.uri, 
        artistId=excluded.artistId, 
        albumId=excluded.albumId, 
        coverArt=excluded.coverArt, 
        coverArtURL=excluded.coverArtURL;
    `);
    const insertSeenSong = await db.prepareAsync(`INSERT INTO seen_songs(id) VALUES ($id);`);

    for (const song of songs) {
      await upsertSong.executeAsync({
        $id: song.id,
        $title: song.title,
        $uri: song.uri,
        $artistId: song.artistId ?? null,
        $albumId: song.albumId ?? null,
        $coverArt: song.coverArt ?? null,
        $coverArtURL: song.coverArtURL ?? null,
      });

      await insertSeenSong.executeAsync({ $id: song.id });

      await fillGenres(song, 'song');
    }

    console.log(`${songs.length} songs synced!`);

    // Prune any media that no longer exists in the database
    await db.execAsync(`
        DELETE FROM artists WHERE NOT EXISTS (SELECT 1 FROM seen_artists WHERE artists.id = seen_artists.id);
        DELETE FROM albums WHERE NOT EXISTS (SELECT 1 FROM seen_albums WHERE albums.id = seen_albums.id);
        DELETE FROM songs WHERE NOT EXISTS (SELECT 1 FROM seen_songs WHERE songs.id = seen_songs.id);
        DELETE FROM genres WHERE NOT EXISTS (SELECT 1 FROM seen_genres WHERE genres.name = seen_genres.name);
    `);
  });
}
