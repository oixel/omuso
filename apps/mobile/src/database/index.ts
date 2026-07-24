import { SubsonicClient } from '@choral/api';
import { createSchema } from './schema';
import { sync } from './sync';

export async function initializeDatabase(client: SubsonicClient) {
  await createSchema();
  await sync(client);
}
