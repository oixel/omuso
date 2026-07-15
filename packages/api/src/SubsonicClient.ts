import * as RequestParam from '@choral/types/src/requests/requestParams';
import * as Response from '@choral/types/src/requests/responses';
import * as Result from '@choral/types/src/requests/results';
import { Credentials, Song } from '@choral/types';
import { SubsonicError } from './SubsonicError';
import { buildRequestURL, cleanParams } from './utils';

export class SubsonicClient {
  constructor(private credentials: Credentials) {}

  private async request<Response>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<Response> {
    const url = buildRequestURL({ credentials: this.credentials, endpoint, params });
    const result = await fetch(url);
    if (!result.ok) {
      throw new SubsonicError(result.status, `HTTP Error ${result.status}: ${result.statusText}`);
    }

    const data = await result.json();
    const response = data['subsonic-response'];

    if (response.status == 'failed') {
      throw new SubsonicError(response.error.code, response.error.message);
    }

    return response as Response;
  }

  // Helper function to generate a cover art URL from the cover art's ID
  private getCoverArtURL = (coverArt: string, size = 100): string => {
    return buildRequestURL({
      credentials: this.credentials,
      endpoint: 'getCoverArt',
      params: { id: coverArt, size: size.toString() },
    });
  };

  // Helper function to attach cover art URLs to any media type
  private attachCoverArt = <Media extends { coverArt?: string; coverArtURL?: string }>(
    media: Media[] | undefined
  ): Media[] => {
    return media
      ? media.map((item) => ({
          ...item,
          coverArtURL: item.coverArt ? this.getCoverArtURL(item.coverArt) : undefined,
        }))
      : [];
  };

  // Helper function to generate a song's stream URL and attach it to it's object
  private attachStreamURL = (songs: Song[]): Song[] => {
    return songs.map((song) => ({
      ...song,
      uri: buildRequestURL({
        credentials: this.credentials,
        endpoint: 'stream',
        params: { id: song.id }, // TODO: Set maxBitRate to match user preferences
      }),
    }));
  };

  search = async ({
    query = '',
    artistCount,
    albumCount,
    songCount,
    artistOffset,
    albumOffset,
    songOffset,
  }: RequestParam.SearchParams): Promise<Result.SearchResult> => {
    // NOTE: This is a Navidrome-specific workaround achieved via trial-and-error.
    // Wrapping single-char queries in quotes with surrounding spaces triggers substring-style matches.
    // This might get patched in the future, but for not it ensures sing-char quotes work properly.
    if (query.length === 1) query = `" ${query} "`;

    const response = await this.request<Response.SearchResponse>(
      'search3',
      cleanParams({
        query,
        artistCount: artistCount?.toString(),
        albumCount: albumCount?.toString(),
        songCount: songCount?.toString(),
        artistOffset: artistOffset?.toString(),
        albumOffset: albumOffset?.toString(),
        songOffset: songOffset?.toString(),
      })
    );

    if (!response || response.status !== 'ok') return { success: false };

    return {
      success: true,
      artists: this.attachCoverArt(response.searchResult3?.artist),
      albums: this.attachCoverArt(response.searchResult3?.album),
      songs: this.attachStreamURL(this.attachCoverArt(response.searchResult3?.song)),
    };
  };

  getGenres = async (): Promise<Result.GetGenresResult> => {
    const response = await this.request<Response.GetGenresResponse>('getGenres');
    if (!response || response.status !== 'ok') return { success: false };

    return {
      success: true,
      genres: response.genres?.genre?.map(({ value: id, ...counts }) => ({ id, ...counts })), // Rename genre's 'value' property to 'id'
    };
  };

  getSongsByGenre = async ({
    genre,
    count, // Defaults to 10 if not provided
    offset, // Defaults to 0 if not provided
  }: RequestParam.GetSongsByGenreParams): Promise<Result.GetSongsByGenreResult> => {
    const response = await this.request<Response.GetSongsByGenreResponse>(
      'getSongsByGenre',
      cleanParams({ genre, count, offset })
    );
    if (!response || response.status !== 'ok') return { success: false };
    return {
      success: true,
      songs: this.attachStreamURL(this.attachCoverArt(response.songsByGenre?.song)),
    };
  };
}
