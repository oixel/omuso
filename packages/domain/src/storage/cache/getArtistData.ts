import { Artist, ArtistImageURLs } from '@omuso/types';
import { Cache } from './cache.native';
import { useAuth } from '../../auth/useAuth';

interface DeezerResponse {
  data: {
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
  }[];
}

interface CachedArtistImages extends ArtistImageURLs {
  index: number;
}

async function getDeezerArtistImages(
  artistName: string,
  resultIndex: number
): Promise<CachedArtistImages | undefined> {
  let response: Response;

  try {
    response = await fetch(
      `https://api.deezer.com/search/artist?q="${encodeURIComponent(artistName)}"`
    );
  } catch {
    return undefined;
  }

  if (!response.ok) return undefined;

  let data: DeezerResponse;

  try {
    data = (await response.json()) as DeezerResponse;
  } catch {
    return undefined; // Malformed data
  }
  if (!data?.data?.length) return undefined;

  const index = resultIndex < data.data.length ? resultIndex : 0;

  return {
    small: data.data[index].picture_small,
    medium: data.data[index].picture_medium,
    big: data.data[index].picture_big,
    xl: data.data[index].picture_xl,
    index,
  };
}

interface ArtistInfo {
  biography?: string;
  similarArtists?: Artist[];
}

interface ArtistData extends ArtistInfo {
  artistImageURLs?: ArtistImageURLs;
}

export async function getArtistData(artist: Artist, onlyGetImages = false): Promise<ArtistData> {
  const picturesCacheKey = `ARTIST-PICTURE-URLS-${artist.id}`;
  const cachedPictures = await Cache.get(picturesCacheKey);
  let artistImageURLs: CachedArtistImages | undefined = undefined;

  if (cachedPictures) artistImageURLs = JSON.parse(cachedPictures) as CachedArtistImages;
  else {
    artistImageURLs = await getDeezerArtistImages(artist.name, 0);

    // Cache Deezer results
    try {
      Cache.set(
        picturesCacheKey,
        JSON.stringify({
          ...artistImageURLs,
          index: 0,
        })
      );
    } catch {
      // Blank so that if caching fails, images are still returned (just not cached)
    }
  }

  if (onlyGetImages) return { artistImageURLs };

  // Fetch biography and similar artists from cache / server
  const infoCacheKey = `ARTIST-INFO-${artist.id}`;
  const cachedInfo = await Cache.get(infoCacheKey);
  let info: ArtistInfo | undefined = undefined;

  if (cachedInfo) info = JSON.parse(cachedInfo) as ArtistInfo;
  else {
    info = await useAuth.getState().client?.getArtistInfo(artist.id);

    // Only cache Artist info if any was found
    if (info?.biography || info?.similarArtists) {
      try {
        Cache.set(
          infoCacheKey,
          JSON.stringify({
            ...info,
          })
        );
      } catch {
        // Exit out of caching safely on failure
      }
    }
  }

  return { artistImageURLs, biography: info?.biography, similarArtists: info?.similarArtists };
}

// TODO:
/*
    User can click "not correct artist image".
    If clicked, fetch next artist from Deezer artist output (if possible).
    If out of artists, fetch from server (?).
*/
