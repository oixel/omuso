import { QueueStore, Song, QueuedSong } from '@omuso/types';
import { getAudioPlayer } from '../audioPlayer';
import { create } from 'zustand';
import { PlayerStorage } from '../storage';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

// Generate a unique ID for every new song added to queue to ensure that different instances of the same song still differ
function createQueuedSong(song: Song): QueuedSong {
  return {
    queueId: uuid(),
    ...song,
  };
}

export const useQueue = create<QueueStore>()(
  persist(
    (set, get) => ({
      index: 0,
      queue: [],

      syncQueue: async () => {
        // Ensure that app's current song index matches AudioPlayer's when reopening the app
        const index = await getAudioPlayer().getSongIndex();
        set({ index });
      },
      restoreQueue: async () => {
        // Restore queue progress from previous listening session in AudioPlayer
        getAudioPlayer().setQueue(get().queue);
        getAudioPlayer().playSong(get().index);
      },

      setQueue: async (songs: Song[]) => {
        let queue = songs.map((song) => createQueuedSong(song));
        getAudioPlayer().setQueue(queue);
        set({ queue });
      },
      updateQueue: async (songs: Song[]) => {
        // getAudioPlayer().updateQueue(get().queue);
        console.log('TODO: Update Queue');
      },
      addNext: async (songs: Song[]) => {
        if (get().queue.length == 0) {
          get().setQueue(songs);
        } else {
          let newSongs = songs.map((song) => createQueuedSong(song));
          getAudioPlayer().addNext(newSongs);

          set((state) => {
            const newQueue = [...state.queue];
            newQueue.splice(get().index + 1, 0, ...newSongs);
            return { queue: newQueue };
          });
        }
      },
      addToEnd: async (songs: Song[]) => {
        if (get().queue.length == 0) {
          get().setQueue(songs);
        } else {
          let newSongs = songs.map((song) => createQueuedSong(song));
          getAudioPlayer().addToEnd(newSongs);

          set((state) => ({ queue: [...state.queue, ...newSongs] }));
        }
      },
      removeFromQueue: async (start: number, end?: number) => {
        getAudioPlayer().removeFromQueue(start, end);

        // Only wipe a single song if no end is provided
        const deleteCount = end !== undefined ? end - start + 1 : 1;

        set((state) => {
          const newQueue = [...state.queue];
          newQueue.splice(start, deleteCount);
          return { queue: newQueue };
        });

        // When AudioPlayer's index falls out of the queue's range bring it back to the end
        const index = get().index;
        const queue = get().queue;
        if (index >= queue.length && queue.length != 0) getAudioPlayer().playSong(queue.length - 1);
      },
    }),
    {
      name: 'queue-storage',
      storage: PlayerStorage,
      partialize: (state) => ({ queue: state.queue, index: state.index }),
    }
  )
);
