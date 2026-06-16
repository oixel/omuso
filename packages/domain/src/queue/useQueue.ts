import { QueueStore, Track, QueuedTrack } from '@choral/types';
import { getAudioPlayer } from '../audioPlayer';
import { create } from 'zustand';
import { PlayerStorage } from '../storage';
import { persist } from 'zustand/middleware';
import uuid from 'react-native-uuid';

// Generate a unique ID for every new track added to queue to ensure that different instances of the same track still differ
function createQueuedTrack(track: Track): QueuedTrack {
  return {
    queueId: uuid.v4(),
    track,
  };
}

export const useQueue = create<QueueStore>()(
  persist(
    (set, get) => ({
      index: 0,
      queue: [],

      syncQueue: async () => {
        // Ensure that app's current track index matches AudioPlayer's when reopening the app
        const index = await getAudioPlayer().getTrackIndex();
        set({ index });
      },
      restoreQueue: async () => {
        // Restore queue progress from previous listening session in AudioPlayer
        getAudioPlayer().setQueue(get().queue);
        getAudioPlayer().playTrack(get().index);
      },

      setQueue: async (tracks: Track[]) => {
        let queue = tracks.map((track) => createQueuedTrack(track));
        getAudioPlayer().setQueue(queue);
        set({ queue });
      },
      updateQueue: async (tracks: Track[]) => {
        // getAudioPlayer().updateQueue(get().queue);
        console.log('TODO: Update Queue');
      },
      addNext: async (tracks: Track[]) => {
        if (get().queue.length == 0) {
          get().setQueue(tracks);
        } else {
          let newTracks = tracks.map((track) => createQueuedTrack(track));
          getAudioPlayer().addNext(newTracks);

          set((state) => {
            const newQueue = [...state.queue];
            newQueue.splice(get().index + 1, 0, ...newTracks);
            return { queue: newQueue };
          });
        }
      },
      addToEnd: async (tracks: Track[]) => {
        if (get().queue.length == 0) {
          get().setQueue(tracks);
        } else {
          let newTracks = tracks.map((track) => createQueuedTrack(track));
          getAudioPlayer().addToEnd(newTracks);

          set((state) => ({ queue: [...state.queue, ...newTracks] }));
        }
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

        // When AudioPlayer's index falls out of the queue's range bring it back to the end
        const index = get().index;
        const queue = get().queue;
        if (index >= queue.length && queue.length != 0)
          getAudioPlayer().playTrack(queue.length - 1);
      },
    }),
    {
      name: 'queue-storage',
      storage: PlayerStorage,
      partialize: (state) => ({ queue: state.queue, index: state.index }),
    }
  )
);
