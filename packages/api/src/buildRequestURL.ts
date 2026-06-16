import { Credentials } from '@choral/types';
import { SubsonicError } from './SubsonicError';

export async function buildRequestURL({
  server,
  credentials,
  endpoint,
  params,
}: {
  server?: string;
  credentials?: Credentials;
  endpoint: string;
  params?: Record<string, string>;
}): Promise<URL> {
  const url = new URL(`${credentials ? credentials : server}/rest/${endpoint}`);

  for (let param in params) {
    url.searchParams.set(param[0], param[1]);
  }

  if (credentials) {
    // If server uses API Key, use it to authenticate, otherwise use regular username + hashed password
    if (credentials.apiKey) url.searchParams.set('apiKey', credentials.apiKey);
    else if (credentials.username && credentials.token && credentials.salt) {
      url.searchParams.set('u', credentials.username);
      url.searchParams.set('t', credentials.token);
      url.searchParams.set('s', credentials.salt);
    } else {
      throw new SubsonicError(400, 'Missing autentication credentials.');
    }
  } else {
  }

  url.searchParams.set('v', '1.16.1'); // Subsonic REST API version
  url.searchParams.set('c', 'choral');
  url.searchParams.set('f', 'json');

  if (params) Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));

  return url;
}
