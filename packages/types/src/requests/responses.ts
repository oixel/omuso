//
// "Responses" refers to the data provided to SubsonicClient.request<T>
// These types filter out the relevant data from the initial response
// This then gets further filtered into a "Result" (results.ts)
//

import { Album, Artist, Song } from '../media';

export interface SubsonicResponse {
  status: string;
}

export interface UnprocessedAlbum extends Omit<Album, 'genres'> {
  genres?: { name: string }[];
  genre?: string;
  song?: UnprocessedSong[];
}

export interface UnprocessedSong extends Omit<Song, 'genres'> {
  genres?: { name: string }[];
  genre?: string;
}

export interface SearchResponse extends SubsonicResponse {
  searchResult3?: {
    artist: Artist[];
    album: UnprocessedAlbum[]; // Regular Subsonic API uses a singles tring 'genre' parameter
    song: UnprocessedSong[];
  };
}

export interface GetGenresResponse extends SubsonicResponse {
  genres?: {
    genre: {
      value: string;
      songCount: number;
      albumCount: number;
    }[];
  };
}

export interface GetSongsByGenreResponse extends SubsonicResponse {
  songsByGenre?: { song: UnprocessedSong[] };
}

export interface GetArtistResponse extends SubsonicResponse {
  artist?: Artist;
}

export interface GetArtistsResponse extends SubsonicResponse {
  artists?: { index: { name: string; artist: Artist[] }[] };
}

export interface GetAlbumResponse extends SubsonicResponse {
  album?: UnprocessedAlbum;
}

export interface GetAlbumListResponse extends SubsonicResponse {
  albumList2?: { album: UnprocessedAlbum[] };
}

export interface GetSongResponse extends SubsonicResponse {
  song?: UnprocessedSong;
}
