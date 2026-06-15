import { QueueStore, Track } from '@choral/types';
import { create } from 'zustand';
import { getAudioPlayer } from '../audioPlayer';

export const useQueue = create<QueueStore>()((set, get) => ({
  index: 0,
  queue: [],

  setQueue: async (tracks: Track[]) => {
    getAudioPlayer().setQueue(tracks);
    set({ queue: tracks });
  },
}));
