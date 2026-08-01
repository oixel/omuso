//
// A collection of helper functions to convert from OpenSubsonic's results to functional Media types
//

import { Album, Artist, Credentials, Song, UnprocessedAlbum, UnprocessedSong } from '@omuso/types';
import { buildRequestURL } from './buildRequestURL';

type Processed<T> = T extends UnprocessedAlbum ? Album : Song;

// Helper function to preserve feature parity with Subsonic's single string genre parameter by converting it into a single-item array
function mergeGenres<T extends UnprocessedAlbum | UnprocessedSong>(
  media: T[] | undefined
): Processed<T>[] | undefined {
  if (media === undefined) return undefined;

  return media.map(({ genres, genre, ...item }) => ({
    ...item,
    genres:
      genres && genres.length != 0
        ? genres.map((g) => g.name)
        : genre !== undefined
          ? [genre]
          : undefined,
  })) as unknown as Processed<T>[];
}

// Helper function to generate a cover art URL from the cover art's ID
function getCoverArtURL(credentials: Credentials, coverArt: string): string {
  return buildRequestURL({
    credentials: credentials,
    endpoint: 'getCoverArt',
    params: { id: coverArt },
  });
}

// Helper function to attach cover art URLs to any media type
function attachCoverArt<Media extends { coverArt?: string; coverArtURL?: string }>(
  credentials: Credentials,
  media: Media[] | undefined
): Media[] {
  return media
    ? media.map((item) => ({
        ...item,
        coverArtURL: item.coverArt ? getCoverArtURL(credentials, item.coverArt) : undefined,
      }))
    : [];
}

// Helper function to generate a song's stream URL and attach it to it's object
function attachStreamURL(credentials: Credentials, songs: Song[]): Song[] {
  return songs.map((song) => ({
    ...song,
    uri: buildRequestURL({
      credentials: credentials,
      endpoint: 'stream',
      params: { id: song.id }, // TODO: Set maxBitRate to match user preferences
    }),
  }));
}

export function processArtists(
  credentials: Credentials,
  artists: Artist[] | undefined
): Artist[] | undefined {
  if (!artists) return undefined;
  return attachCoverArt(credentials, artists);
}

export function processAlbums(
  credentials: Credentials,
  albums: UnprocessedAlbum[] | undefined
): Album[] | undefined {
  if (!albums) return undefined;
  const merged = mergeGenres(albums);
  return attachCoverArt(credentials, merged);
}

export function processSongs(
  credentials: Credentials,
  songs: UnprocessedSong[] | undefined
): Song[] | undefined {
  if (!songs) return undefined;
  const merged = mergeGenres(songs);
  const withArt = attachCoverArt(credentials, merged);
  return attachStreamURL(credentials, withArt);
}
