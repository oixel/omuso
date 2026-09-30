import { HistoryStore, Media } from '@omuso/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerStorage } from '../appState/PlayerStorage';

export const useHistory = create<HistoryStore>()(
  persist(
    (set, _get) => ({
      history: [],

      addToHistory: (media: Media) => {
        set((state) => {
          return { history: [media, ...state.history.filter((item) => item.id !== media.id)] };
        });
      },
      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'history-storage',
      storage: PlayerStorage,
      partialize: (state) => ({ history: state.history }),
    }
  )
);
