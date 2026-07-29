import { create } from 'zustand';
import { getAudioPlayer } from './audioPlayerRegistery';
import { PlaybackStore, PlaybackState } from '@choral/types';
import { persist } from 'zustand/middleware';
import { PlayerStorage } from '../storage';

//
// Consumed by UI to get / alter AudioPlayer's state
//

const RESTART_MARKER = 5000; // TODO: (milliseconds) make a preference

// Does not use set / get since this store is event-driven using listeners to ensure that states are in sync
export const usePlayback = create<PlaybackStore>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      position: 0,
      duration: 0,

      syncPlayback: async () => {
        // Ensure that app's pause state matches AudioPlayer's when reopening the app
        const isPlaying = await getAudioPlayer().getIsPlaying();
        const position = await getAudioPlayer().getPosition();
        const duration = await getAudioPlayer().getDuration();
        set({ isPlaying, position, duration });
      },
      restorePlayback: async () => {
        // Restore progress from previous listening session in AudioPlayer
        await get().seekTo(get().position);
      },

      play: async () => {
        await getAudioPlayer().play();
      },
      pause: async () => {
        await getAudioPlayer().pause();
      },
      togglePause: async () => {
        await getAudioPlayer().togglePause();
      },
      getPlaybackState: async (): Promise<PlaybackState> => {
        return await getAudioPlayer().getPlaybackState();
      },
      getIsPlaying: async (): Promise<boolean> => {
        return await getAudioPlayer().getIsPlaying();
      },

      seekTo: async (position: number) => {
        await getAudioPlayer().seekTo(position);
      },
      prev: async () => {
        await getAudioPlayer().prev();
      },
      skip: async () => {
        await getAudioPlayer().skip();
      },
      restartOrPrev: async (queueIndex?: number) => {
        if (queueIndex === 0 || get().position > RESTART_MARKER) get().seekTo(0);
        else get().prev();
      },
    }),
    {
      name: 'playback-storage',
      storage: PlayerStorage,
      partialize: (state) => ({ position: state.position }),
    }
  )
);
