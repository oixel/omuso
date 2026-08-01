import { connectQueueToClient } from '@omuso/domain';
import { initializeNativeAudioPlayer } from './initializeNativeAudioPlayer';
import { SubsonicClient } from '@omuso/api';

export async function initializeApp(client: SubsonicClient) {
  await initializeNativeAudioPlayer();
  await connectQueueToClient(client);
}
