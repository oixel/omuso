//
// "Request Params" are the parameters expected from a <SubsonicClient.<requestMethod>({params})
//

export interface SearchParams {
  query?: string;
  artistCount?: number;
  albumCount?: number;
  trackCount?: number;
}
