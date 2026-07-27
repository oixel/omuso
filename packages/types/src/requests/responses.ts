//
// "Responses" refers to the data provided to SubsonicClient.request<T>
// These types filter out the relevant data from the initial response
// This then gets further filtered into a "Result" (results.ts)
//

import { Album, Artist, Song } from '../media';

interface SubsonicResponse {
  status: string;
}

type ExtendedAlbum = Album & { genre?: string };
type ExtendedSong = Song & { genre?: string };

export interface SearchResponse extends SubsonicResponse {
  searchResult3?: {
    artist: Artist[];
    album: ExtendedAlbum[]; // Regular Subsonic API uses a singles tring 'genre' parameter
    song: ExtendedSong[];
  };
}

export interface GetSongsByGenreResponse extends SubsonicResponse {
  songsByGenre?: { song: ExtendedSong[] };
}
