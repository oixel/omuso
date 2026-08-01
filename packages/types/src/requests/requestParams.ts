//
// "Request Params" are the parameters expected from a <SubsonicClient.<requestMethod>({params})
//

export interface SearchParams {
  query?: string;
  artistCount?: number;
  albumCount?: number;
  songCount?: number;
  artistOffset?: number;
  albumOffset?: number;
  songOffset?: number;
}

export interface GetSongsByGenreParams {
  genre: string;
  count?: number;
  offset?: number;
}
