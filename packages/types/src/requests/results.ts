//
// "Results" refer to the data returned to the app from a SubsonicClient.<requestMethod>()
// The results take the filtered data from "Response" (responses.ts) and picks out the relevant data
//

import { Album, Artist, Song } from '../media';

interface Result {
  success: boolean;
}

export interface ServerResult extends Result {
  usesAPIKey?: boolean;
}

export interface SearchResult extends Result {
  artists?: Artist[];
  albums?: Album[];
  songs?: Song[];
}

export interface GetArtistResult extends Result {
  artist?: Artist;
}

export interface GetAlbumResult extends Result {
  album?: Album;
}

export interface GetSongResult extends Result {
  song?: Song;
}
