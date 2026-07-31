import { db } from './client';
import { SubsonicClient } from '@choral/api';
import { Album, Artist, Song } from '@choral/types';

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

let syncing = false;

// Upsert all data from SubsonicClient into local SQLite DB and prune removed media
export async function sync(client: SubsonicClient) {
  if (syncing) {
    console.log('Sync is already in progress, skipping...');
    return;
  }

  syncing = true;

  console.log('Starting database sync!');

  try {
    const [artists, albums, songs] = await Promise.all([
      fetchAllArtists(client),
      fetchAllAlbums(client),
      fetchAllSongs(client),
    ]);

    // Create name lookup tables for artists / albums from in-memory data to avoid having to query the database for filling out the media_search table with name data
    const artistNames = new Map(artists.map((artist) => [artist.id, artist.name]));
    const albumNames = new Map(albums.map((album) => [album.id, album.name]));

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

      // ------
      // Genres
      // ------

      // Handle upserting genres first since both Albums and Songs use it as FOREIGN KEY in their join tables

      // Dedupe all present genres to only upsert each once
      const genres = new Set<string>();
      for (const album of albums) album.genres?.forEach((genre) => genres.add(genre));
      for (const song of songs) song.genres?.forEach((genre) => genres.add(genre));

      const upsertGenre = await db.prepareAsync(`
      INSERT INTO genres(name) VALUES ($name) 
      ON CONFLICT(name) DO UPDATE SET name=excluded.name;
    `);
      const insertSeenGenre = await db.prepareAsync(`INSERT INTO seen_genres(name) VALUES ($name)`);

      for (const genre of genres) {
        await upsertGenre.executeAsync({ $name: genre });
        await insertSeenGenre.executeAsync({ $name: genre });
      }
      await upsertGenre.finalizeAsync();
      await insertSeenGenre.finalizeAsync();

      // Prepare message to replicate upserting on FTS5 search table since traditional ON CONFLICT DO UPDATE does not work for it
      const deleteSearchEntry = await db.prepareAsync(
        `DELETE FROM media_search WHERE id = $id AND type = $type;`
      );

      // ------
      // Artists
      // ------

      // Prepare SQL statements once to avoid expo-sqlite parsing and recompiling on every loop
      const upsertArtist = await db.prepareAsync(`
      INSERT INTO artists(id, name, coverArt, coverArtURL, starred) VALUES ($id, $name, $coverArt, $coverArtURL, $starred)
      ON CONFLICT(id) DO UPDATE SET 
      name=excluded.name, coverArt=excluded.coverArt, coverArtURL=excluded.coverArtURL, starred=excluded.starred;
      `);
      const insertSearchArtist = await db.prepareAsync(`
        INSERT INTO media_search(id, type, name) VALUES ($id, $type, $name);
      `);
      const insertSeenArtist = await db.prepareAsync(`INSERT INTO seen_artists(id) VALUES ($id);`);

      try {
        for (const artist of artists) {
          await upsertArtist.executeAsync({
            $id: artist.id,
            $name: artist.name,
            $coverArt: artist.coverArt ?? null,
            $coverArtURL: artist.coverArtURL ?? null,
            $starred: artist.starred ?? null,
          });

          await deleteSearchEntry.executeAsync({ $id: artist.id, $type: 'artist' });
          await insertSearchArtist.executeAsync({
            $id: artist.id,
            $type: 'artist',
            $name: artist.name,
          });

          await insertSeenArtist.executeAsync({ $id: artist.id });
        }
      } catch (e) {
        console.error('Upserting artists failed with ERROR:', e);
      } finally {
        await upsertArtist.finalizeAsync();
        await insertSearchArtist.finalizeAsync();
        await insertSeenArtist.finalizeAsync();
        console.log(`${artists.length} artists synced!`);
      }

      // ------
      // Albums
      // ------

      const upsertAlbum = await db.prepareAsync(`
      INSERT INTO albums(id, name, songCount, duration, created, artistId, coverArt, coverArtURL, starred) 
        VALUES ($id, $name, $songCount, $duration, $created, $artistId, $coverArt, $coverArtURL, $starred)
        ON CONFLICT(id) DO UPDATE SET 
          name=excluded.name, 
          songCount=excluded.songCount, 
          duration=excluded.duration, 
          created=excluded.created, 
          artistId=excluded.artistId, 
          coverArt=excluded.coverArt, 
          coverArtURL=excluded.coverArtURL,
          starred=excluded.starred;
    `);
      const upsertAlbumGenre = await db.prepareAsync(`
      INSERT INTO album_genres(albumId, genre) VALUES ($albumId, $genre)
      ON CONFLICT(albumId, genre) 
        DO UPDATE SET albumId=excluded.albumId, genre=excluded.genre;
    `);
      const insertSearchAlbum = await db.prepareAsync(
        `INSERT INTO media_search(id, type, name, artistName) VALUES ($id, $type, $name, $artistName);`
      );
      const insertSeenAlbum = await db.prepareAsync(`INSERT INTO seen_albums(id) VALUES ($id);`);

      try {
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
            $starred: album.starred ?? null,
          });

          if (album.genres !== undefined) {
            for (const genre of album.genres) {
              await upsertAlbumGenre.executeAsync({ $albumId: album.id, $genre: genre });
            }
          }

          // "Upsert" media_search table with relevant data for the album to enable indexed FTS5 searching
          const artistName = album.artistId ? (artistNames.get(album.artistId) ?? null) : null;
          await deleteSearchEntry.executeAsync({ $id: album.id, $type: 'album' });
          await insertSearchAlbum.executeAsync({
            $id: album.id,
            $type: 'album',
            $name: album.name,
            $artistName: artistName,
          });

          await insertSeenAlbum.executeAsync({ $id: album.id });
        }
      } catch (e) {
        console.error('Upserting albums failed with ERROR:', e);
      } finally {
        await upsertAlbum.finalizeAsync();
        await upsertAlbumGenre.finalizeAsync();
        await insertSearchAlbum.finalizeAsync();
        await insertSeenAlbum.finalizeAsync();
        console.log(`${albums.length} albums synced!`);
      }

      // ------
      // Songs
      // ------

      const upsertSong = await db.prepareAsync(`
      INSERT INTO songs(id, title, uri, artistId, albumId, coverArt, coverArtURL, starred) 
      VALUES ($id, $title, $uri, $artistId, $albumId, $coverArt, $coverArtURL, $starred)
      ON CONFLICT(id) DO UPDATE SET 
        title=excluded.title, 
        uri=excluded.uri, 
        artistId=excluded.artistId, 
        albumId=excluded.albumId, 
        coverArt=excluded.coverArt, 
        coverArtURL=excluded.coverArtURL,
        starred=excluded.starred;
      `);
      const upsertSongGenre = await db.prepareAsync(`
      INSERT INTO song_genres(songId, genre) VALUES ($songId, $genre)
      ON CONFLICT(songId, genre) 
        DO UPDATE SET songId=excluded.songId, genre=excluded.genre;
      `);
      const insertSearchSong = await db.prepareAsync(`
      INSERT INTO media_search(id, type, name, artistName, albumName)
        VALUES ($id, $type, $name, $artistName, $albumName);
      `);
      const insertSeenSong = await db.prepareAsync(`INSERT INTO seen_songs(id) VALUES ($id);`);

      try {
        for (const song of songs) {
          await upsertSong.executeAsync({
            $id: song.id,
            $title: song.title,
            $uri: song.uri,
            $artistId: song.artistId ?? null,
            $albumId: song.albumId ?? null,
            $coverArt: song.coverArt ?? null,
            $coverArtURL: song.coverArtURL ?? null,
            $starred: song.starred ?? null,
          });

          if (song.genres !== undefined) {
            for (const genre of song.genres ?? []) {
              await upsertSongGenre.executeAsync({ $songId: song.id, $genre: genre });
            }
          }

          // "Upsert" media_search table with relevant data for the song to enable indexed FTS5 searching
          const artistName = song.artistId ? (artistNames.get(song.artistId) ?? null) : null;
          const albumName = song.albumId ? (albumNames.get(song.albumId) ?? null) : null;
          await deleteSearchEntry.executeAsync({ $id: song.id, $type: 'song' });
          await insertSearchSong.executeAsync({
            $id: song.id,
            $type: 'song',
            $name: song.title,
            $artistName: artistName,
            $albumName: albumName,
          });

          await insertSeenSong.executeAsync({ $id: song.id });
        }
      } catch (e) {
        console.error('Upserting songs failed with ERROR:', e);
      } finally {
        await upsertSong.finalizeAsync();
        await upsertSongGenre.finalizeAsync();
        await insertSearchSong.finalizeAsync();
        await insertSeenSong.finalizeAsync();
        console.log(`${songs.length} songs synced!`);

        await deleteSearchEntry.finalizeAsync();
      }

      // ------
      // Pruning
      // ------

      // Prune any media that no longer exists in the database
      await db.execAsync(`
        DELETE FROM artists WHERE NOT EXISTS (SELECT 1 FROM seen_artists WHERE artists.id = seen_artists.id);
        DELETE FROM albums WHERE NOT EXISTS (SELECT 1 FROM seen_albums WHERE albums.id = seen_albums.id);
        DELETE FROM songs WHERE NOT EXISTS (SELECT 1 FROM seen_songs WHERE songs.id = seen_songs.id);
        DELETE FROM genres WHERE NOT EXISTS (SELECT 1 FROM seen_genres WHERE genres.name = seen_genres.name);
    `);
    });
  } finally {
    syncing = false;
  }
}
