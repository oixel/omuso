import { QueueStore, Track, QueuedTrack } from '@choral/types';
import { getAudioPlayer } from '../audioPlayer';
import { create } from 'zustand';
import uuid from 'react-native-uuid';

// Generate a unique ID for every new track added to queue to ensure that different instances of the same track still differ
function createQueuedTrack(track: Track): QueuedTrack {
  return {
    queueId: uuid.v4(),
    track,
  };
}

export const useQueue = create<QueueStore>()((set, get) => ({
  index: 0,
  queue: [],

  setQueue: async (tracks: Track[]) => {
    let queue = tracks.map((track) => createQueuedTrack(track));
    getAudioPlayer().setQueue(queue);
    set({ queue });
  },
}));
