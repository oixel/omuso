//
// "Responses" refers to the data provided to SubsonicClient.request<T>
// These types filter out the relevant data from the initial response
// This then gets further filtered into a "Result" (results.ts)
//

import { Album, Artist, Song } from '../media';

interface SubsonicResponse {
  status: string;
}

export type UnprocessedAlbum = Omit<Album, 'genres'> & {
  genres?: { name: string }[];
  genre?: string;
};

export type UnprocessedSong = Omit<Song, 'genres'> & {
  genres?: { name: string }[];
  genre?: string;
};

export interface SearchResponse extends SubsonicResponse {
  searchResult3?: {
    artist: Artist[];
    album: UnprocessedAlbum[]; // Regular Subsonic API uses a singles tring 'genre' parameter
    song: UnprocessedSong[];
  };
}

export interface GetSongsByGenreResponse extends SubsonicResponse {
  songsByGenre?: { song: UnprocessedSong[] };
}
