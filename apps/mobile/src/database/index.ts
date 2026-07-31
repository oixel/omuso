import { SubsonicClient } from '@choral/api';
import { createSchema } from './schema';
import { sync } from './sync';

export { clearDatabase } from './schema'; // Forward database wipe method
export { sync } from './sync'; // Forward database syncing method
export { search } from './search'; // Forward FTS5 media_search table querying
export * from './media';
export * from './artists';
export * from './albums';
export * from './songs';
export * from './genres';

export async function initializeDatabase(client: SubsonicClient) {
  await createSchema();
  await sync(client);
}
