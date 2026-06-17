import { SubsonicError } from './SubsonicError';
import { Credentials } from '@choral/types';
import { md5 } from '@noble/hashes/legacy.js';
import { bytesToHex, randomBytes } from '@noble/hashes/utils.js';

export function hashPassword(credentials: Credentials): { token: string; salt: string } {
  const LENGTH = 12;
  const salt: string = bytesToHex(randomBytes(LENGTH)).slice(0, LENGTH);
  const token: string = bytesToHex(md5(new TextEncoder().encode(credentials.password + salt)));
  return { token, salt };
}

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
  const url = new URL(`${credentials ? credentials.server : server}/rest/${endpoint}`);

  if (credentials) {
    // If server uses API Key, use it to authenticate, otherwise use regular username + hashed password
    if (credentials.apiKey) url.searchParams.set('apiKey', credentials.apiKey);
    else if (credentials.username && credentials.password) {
      const { token, salt } = hashPassword(credentials);

      url.searchParams.set('u', credentials.username);
      url.searchParams.set('t', token);
      url.searchParams.set('s', salt);
    } else {
      throw new SubsonicError(400, 'Missing autentication credentials.');
    }
  } else {
  }

  url.searchParams.set('v', '1.16.1'); // Subsonic REST API version
  url.searchParams.set('c', 'choral');
  url.searchParams.set('f', 'json');

  if (params)
    Object.entries(params).forEach(([param, value]) => url.searchParams.set(param, value));

  return url;
}
