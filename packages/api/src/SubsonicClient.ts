import * as Request from '@choral/types/src/requests';
import { Credentials } from '@choral/types';
import { SubsonicError } from './SubsonicError';
import { buildRequestURL } from './buildRequestURL';

export class SubsonicClient {
  constructor(private credentials: Credentials) {}

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = await buildRequestURL({ credentials: this.credentials, endpoint, params });

    const result = await fetch(url);
    if (!result.ok) {
      throw new SubsonicError(result.status, `HTTP Error ${result.status}: ${result.statusText}`);
    }

    const data = await result.json();
    const response = data['subsonic-response'];

    if (response.status == 'failed') {
      throw new SubsonicError(response.error.code, response.error.message);
    }

    return response as T;
  }

  // Takes in request params and cleans out any undefined
  cleanParams = (params: Record<string, string | undefined>): Record<string, string> => {
    const defined = Object.entries(params).filter(([, value]) => value != undefined) as [
      string,
      string,
    ][];
    return Object.fromEntries(defined);
  };

  search = async ({
    query = '',
    artistCount,
    albumCount,
    trackCount,
  }: Request.SearchParams): Promise<Request.SearchResult> => {
    const result = await this.request<Request.SearchResponse>(
      'search3',
      this.cleanParams({
        query,
        artistCount: artistCount?.toString(),
        albumCount: albumCount?.toString(),
        songCount: trackCount?.toString(),
      })
    );

    if (result.status !== 'ok') return { success: false };

    return {
      success: true,
      artists: result?.searchResult3?.artist,
      albums: result?.searchResult3?.album,
      tracks: result?.searchResult3?.song,
    };
  };
}
