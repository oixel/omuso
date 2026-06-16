import { buildRequestURL, SubsonicError } from '@choral/api';
import { ServerValidationRequest } from '@choral/types';

export async function validateServer(server: string): Promise<ServerValidationRequest | null> {
  try {
    const url = await buildRequestURL({ server, endpoint: 'getOpenSubsonicExtensions' });

    const result = await fetch(url);

    if (!result.ok) throw new SubsonicError(404, 'Request Error: Server not found.');

    const data = await result.json();
    const response = data['subsonic-response'];

    if (response.status != 'ok') {
      throw new SubsonicError(response.error.code, response.error.message);
    }

    return response as ServerValidationRequest;
  } catch {
    return null;
  }
}
