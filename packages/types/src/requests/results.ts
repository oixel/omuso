//
// "Results" refer to the data returned to the app from a SubsonicClient.<requestMethod>()
// The results take the filtered data from "Response" (responses.ts) and picks out the relevant data
//

import { Album, Artist, Song, Genre } from '../media';

interface Result {
  success: boolean;
}

export interface ServerResult extends Result {
  success: boolean;
  usesAPIKey?: boolean;
}

export interface SearchResult extends Result {
  artists?: Artist[];
  albums?: Album[];
  songs?: Song[];
}

export interface GetGenresResult extends Result {
  genres?: Genre[];
}

export interface GetSongsByGenreResult extends Result {
  songs?: Song[];
}
