import { Credentials } from '@choral/types';
import { SubsonicError } from './SubsonicError';
import { buildRequestURL } from './buildRequestURL';

export class SubsonicClient {
  constructor(private credentials: Credentials) {}

  private async request<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    const url = await buildRequestURL({ credentials: this.credentials, endpoint, params });
    const result = await fetch(url);
    if (!result.ok) {
      throw new SubsonicError(result.status, `HTTP Error ${result.status}: ${result.statusText}`);
    }

    const data = await result.json();
    const response = data['subsonic-response'];

    if (response.status == 'failed') {
      throw new SubsonicError(response.error.code, response.error.message);
    }

    return response as T;
  }
}
