import * as RequestParam from '@choral/types/src/requests/requestParams';
import * as Response from '@choral/types/src/requests/responses';
import * as Result from '@choral/types/src/requests/results';
import { Credentials, Media } from '@choral/types';
import { SubsonicError } from './SubsonicError';
import { buildRequestURL, cleanParams } from './utils';
import { processAlbums, processArtists, processSongs } from './utils/processMedia';
import { isAlbum, isArtist } from '@choral/domain/src/utils/verifyMedia';

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
    return { success: true, artist: processArtists(this.credentials, [response.artist])?.at(0) };
  };

  getAlbum = async (id: string): Promise<Result.GetAlbumResult> => {
    const response = await this.request<Response.GetAlbumResponse>('getAlbum', { id });
    if (!response || response.status !== 'ok' || !response.album) return { success: false };
    return { success: true, album: processAlbums(this.credentials, [response.album])?.at(0) };
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

    return {
      success: true,
      artists: processArtists(this.credentials, response.searchResult3?.artist),
      albums: processAlbums(this.credentials, response.searchResult3?.album),
      songs: processSongs(this.credentials, response.searchResult3?.song),
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
