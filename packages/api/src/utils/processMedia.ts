//
// A collection of helper functions to convert from OpenSubsonic's results to functional Media types
//

import { Album, Artist, Credentials, Song } from '@choral/types';
import { buildRequestURL } from './buildRequestURL';

// Helper function to preserve feature parity with Subsonic's single string genre parameter by converting it into a single-item array
function mergeGenres<T extends Album | Song>(media: (T & { genre?: string })[]): T[] {
  return media.map(
    ({ genre, ...item }) =>
      ({
        ...item,
        genres: item.genres ?? (genre ? [genre] : undefined),
      }) as T
  );
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
  albums: Album[] | undefined
): Album[] | undefined {
  if (!albums) return undefined;
  const merged = mergeGenres(albums);
  return attachCoverArt(credentials, merged);
}

export function processSongs(
  credentials: Credentials,
  songs: Song[] | undefined
): Song[] | undefined {
  if (!songs) return undefined;
  const merged = mergeGenres(songs);
  const withArt = attachCoverArt(credentials, merged);
  return attachStreamURL(credentials, withArt);
}
