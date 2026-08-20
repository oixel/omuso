import { Artist, ArtistImageURLs } from '@omuso/types';
import { Cache } from './cache';

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

export async function getArtistImage(artist: Artist): Promise<ArtistImageURLs | undefined> {
  const cacheKey = `ARTIST-PICTURE-URLS-${artist.id}`;
  const cached = await Cache.get(cacheKey);
  if (cached) return JSON.parse(cached) as CachedArtistImages;

  const artistImageURLs = await getDeezerArtistImages(artist.name, 0);
  if (!artistImageURLs) return undefined;

  try {
    Cache.set(
      cacheKey,
      JSON.stringify({
        ...artistImageURLs,
        index: 0,
      })
    );
  } catch {
    // Blank so that if caching fails, images are still returned (just not cached)
  }

  return artistImageURLs;
}

// TODO:
/*
    User can click "not correct artist image".
    If clicked, fetch next artist from Deezer artist output (if possible).
    If out of artists, fetch from server (?).
*/
