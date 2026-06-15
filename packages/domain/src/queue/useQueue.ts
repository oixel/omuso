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
  updateQueue: async (tracks: Track[]) => {
    console.log('TODO: updateQueue');
  },
  addNext: async (tracks: Track[]) => {
    let newTracks = tracks.map((track) => createQueuedTrack(track));
    getAudioPlayer().addNext(newTracks);

    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(get().index + 1, 0, ...newTracks);
      return { queue: newQueue };
    });
  },
  addToEnd: async (tracks: Track[]) => {
    let newTracks = tracks.map((track) => createQueuedTrack(track));
    getAudioPlayer().addToEnd(newTracks);

    set((state) => ({ queue: [...state.queue, ...newTracks] }));
  },
  removeFromQueue: async (start: number, end?: number) => {
    getAudioPlayer().removeFromQueue(start, end);

    // Only wipe a single track if no end is provided
    const deleteCount = end !== undefined ? end - start + 1 : 1;

    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(start, deleteCount);
      return { queue: newQueue };
    });
  },
}));
