import { initializeNativeAudioPlayer } from './initializeNativeAudioPlayer';
import { initializeDatabase } from '@database';
import { SubsonicClient } from '@choral/api';

// Interface for calling any other required init methods
export async function initializeChoral(client: SubsonicClient) {
  await initializeNativeAudioPlayer();
  await initializeDatabase(client);
}
