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

export interface GetAlbumListParams {
  type:
    | 'random'
    | 'newest'
    | 'highest'
    | 'frequent'
    | 'recent'
    | 'alphabeticalByName'
    | 'alphabeticalByArtist'
    | 'starred'
    | 'byYear'
    | 'byGenre';
  size?: number; // Default 10, max 500
  offset?: number; // Default 0
  fromYear?: number; // Required if type is byYear
  toYear?: number; // Required if type is byYear
  genre?: string; // Required if type is byGenre
}
