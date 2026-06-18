import * as RequestParam from '@choral/types/src/requests/requestParams';
import * as Response from '@choral/types/src/requests/responses';
import * as Result from '@choral/types/src/requests/results';
import { Credentials } from '@choral/types';
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

  search = async ({
    query = '',
    artistCount,
    albumCount,
    trackCount,
    artistOffset,
    albumOffset,
    trackOffset,
  }: RequestParam.SearchParams): Promise<Result.SearchResult> => {
    // NOTE: This is a Navidrome-specific workaround achieved via trial-and-error.
    // Wrapping single-char queries in quotes with surrounding spaces triggers substring-style matches.
    // This might get patched in the future, but for not it ensures sing-char quotes work properly.
    if (query.length === 1) query = `" ${query} "`;

    const result = await this.request<Response.SearchResponse>(
      'search3',
      cleanParams({
        query,
        artistCount: artistCount?.toString(),
        albumCount: albumCount?.toString(),
        songCount: trackCount?.toString(),
        artistOffset: artistOffset?.toString(),
        albumOffset: albumOffset?.toString(),
        songOffset: trackOffset?.toString(),
      })
    );

    if (result.status !== 'ok') return { success: false };

    return {
      success: true,
      artists: this.attachCoverArt(result?.searchResult3?.artist),
      albums: this.attachCoverArt(result?.searchResult3?.album),
      tracks: this.attachCoverArt(result?.searchResult3?.song),
    };
  };
}
