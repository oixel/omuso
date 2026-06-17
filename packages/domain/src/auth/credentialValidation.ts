import { buildRequestURL } from '@choral/api';
import { ServerResult, Credentials } from '@choral/types';
import { SecureStorage } from '../storage';

// Checks whether the given server actually exists, and returns extensions (indicates if apiKey is used)
export async function validateServer(server: string): Promise<ServerResult> {
  try {
    const url = await buildRequestURL({ server, endpoint: 'getOpenSubsonicExtensions' });

    const result = await fetch(url);
    if (!result.ok) throw new Error();

    const data = await result.json();
    const response = data['subsonic-response'];
    if (response.status != 'ok') throw new Error();

    const extensions: [] = response.openSubsonicExtensions;
    const usesAPIKey = extensions.some((extension) => extension['name'] == 'apiKeyAuthentication');

    return { success: true, usesAPIKey };
  } catch {
    return { success: false };
  }
}

// Checks whether the given login credentials are valid for the current server
export async function validateLogin({
  server,
  apiKey,
  username,
  password,
}: {
  server: string;
  apiKey?: string;
  username?: string;
  password?: string;
}): Promise<boolean> {
  const credentials: Credentials = {
    server,
    apiKey,
    username,
    password,
  };
  try {
    const url = await buildRequestURL({ endpoint: 'ping', credentials });
    const result = await fetch(url);
    if (!result.ok) return false;

    const data = await result.json();
    const response = data['subsonic-response'];
    if (response.status != 'ok') return false;

    SecureStorage.save('credentials', JSON.stringify(credentials));
    return true;
  } catch {
    return false;
  }
}
