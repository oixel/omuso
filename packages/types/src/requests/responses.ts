//
// "Responses" refers to the data provided to SubsonicClient.request<T>
// These types filter out the relevant data from the initial response
// This then gets further filtered into a "Result" (results.ts)
//

import { Album, Artist, Song } from '../media';

interface SubsonicResponse {
  status: string;
}

export interface SearchResponse extends SubsonicResponse {
  searchResult3?: {
    artist: Artist[];
    album: Album[];
    song: Song[];
  };
}
