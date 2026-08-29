import * as RequestParam from '@omuso/types/src/requests/requestParams';
import * as Response from '@omuso/types/src/requests/responses';
import * as Result from '@omuso/types/src/requests/results';
import { Credentials, Media } from '@omuso/types';
import { SubsonicError } from './SubsonicError';
import { buildRequestURL, cleanParams } from './utils';
import { processAlbums, processArtists, processSongs } from './utils/processMedia';
import { isAlbum, isArtist } from '@omuso/domain/src/utils/verifyMedia';

export class SubsonicClient {
  constructor(private credentials: Credentials) {}

  // Allow UI components to subscribe to media being updated
  private _updatedMedia?: Media;
  private listeners = new Set<() => void>();

  get updatedMedia() {
    return this._updatedMedia;
  }

  private setUpdatedMedia(media: Media) {
    this._updatedMedia = media;
    this.listeners.forEach((listener) => listener()); // Notify all listeners that media has been updated
  }

  // Called in useUpdatedMedia to connect to useSyncExternalStore
  subscribe = (listener: () => void) => {
    this.listeners.add(listener); // Add listener to Set so it can get notified
    return () => this.listeners.delete(listener); // Unsubscribe handle for future disconnecting
  };

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

  //
  // Getters from media IDs
  //
  getArtist = async (id: string): Promise<Result.GetArtistResult> => {
    const response = await this.request<Response.GetArtistResponse>('getArtist', { id });
    if (!response || response.status !== 'ok' || !response.artist) return { success: false };
    const artists = await processArtists(this.credentials, [response.artist]);
    return { success: true, artist: artists?.at(0) };
  };

  getArtists = async (): Promise<Result.GetArtistsResult> => {
    const response = await this.request<Response.GetArtistsResponse>('getArtists');
    if (!response || response.status !== 'ok' || !response?.artists?.index)
      return { success: false };
    const flattened = response.artists.index.map((c) => c.artist.map((artist) => artist)).flat();
    const artists = await processArtists(this.credentials, flattened);
    return { success: true, artists };
  };

  getArtistInfo = async (
    id: string,
    similarArtistCount?: number
  ): Promise<Result.GetArtistInfoResult> => {
    const response = await this.request<Response.GetArtistInfoResponse>(
      'getArtistInfo',
      cleanParams({
        id,
        count: similarArtistCount?.toString(),
      })
    );

    if (!response || response.status !== 'ok' || !response.artistInfo) return { success: false };

    return {
      success: true,
      biography: response.artistInfo.biography,
      similarArtists: response.artistInfo.similarArtist,
    };
  };

  getAlbum = async (id: string): Promise<Result.GetAlbumResult> => {
    const response = await this.request<Response.GetAlbumResponse>('getAlbum', { id });
    if (!response || response.status !== 'ok' || !response.album) return { success: false };
    return { success: true, album: processAlbums(this.credentials, [response.album])?.at(0) };
  };

  getAlbumList = async ({
    type,
    size,
    offset,
    fromYear,
    toYear,
    genre,
  }: RequestParam.GetAlbumListParams): Promise<Result.GetAlbumListResult> => {
    const response = await this.request<Response.GetAlbumListResponse>(
      'getAlbumList2',
      cleanParams({ type, size, offset, fromYear, toYear, genre })
    );

    if (!response || response.status !== 'ok') return { success: false };

    return {
      success: true,
      albums: processAlbums(this.credentials, response.albumList2?.album),
    };
  };

  getSong = async (id: string): Promise<Result.GetSongResult> => {
    const response = await this.request<Response.GetSongResponse>('getSong', { id });
    if (!response || response.status !== 'ok' || !response.song) return { success: false };
    return { success: true, song: processSongs(this.credentials, [response.song])?.at(0) };
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

    const artists = await processArtists(this.credentials, response.searchResult3?.artist);

    return {
      success: true,
      artists,
      albums: processAlbums(this.credentials, response.searchResult3?.album),
      songs: processSongs(this.credentials, response.searchResult3?.song),
    };
  };

  getGenres = async (): Promise<Result.GetGenresResult> => {
    const response = await this.request<Response.GetGenresResponse>('getGenres');
    if (!response || response.status !== 'ok') return { success: false };

    return {
      success: true,
      genres: response.genres?.genre?.map(({ value }) => value), // Simply return all genre names
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

    if (!response || response.status !== 'ok' || !response.songsByGenre?.song)
      return { success: false };

    return {
      success: true,
      songs: processSongs(this.credentials, response.songsByGenre.song),
    };
  };

  toggleStarred = async (
    media: Media,
    currentlyStarred: boolean
  ): Promise<Result.ToggleStarredResult> => {
    const endpoint = currentlyStarred ? 'unstar' : 'star'; // Run opposite endpoint of starred status

    const response = await this.request<Response.SubsonicResponse>(
      endpoint,
      cleanParams({
        id: media.id,
        albumId: isAlbum(media) ? media.id : undefined,
        artistId: isArtist(media) ? media.id : undefined,
      })
    );

    if (!response || response.status !== 'ok') return { success: false };

    // Notify listeners that media has been updated
    const updateTime = new Date().toISOString();
    const newStatus = !currentlyStarred ? updateTime : undefined; // Time or undefined matches OpenSubsonic's API response
    this.setUpdatedMedia({ ...media, starred: newStatus });

    return {
      success: true,
      starred: newStatus,
    };
  };
}
