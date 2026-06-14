import { create } from 'zustand';
import { getAudioPlayer } from './audioPlayerRegistery';
import { PlaybackStore } from '@choral/types';

// Does not use set / get since this store is event-driven using listeners to ensure that states are in sync
export const usePlayback = create<PlaybackStore>()((_set, get) => ({
  isPlaying: false,
  isBuffering: false,
  position: 0,
  duration: 0,

  play: async () => {
    await getAudioPlayer().play();
    console.log('All good');
  },
  pause: async () => {
    await getAudioPlayer().pause();
  },
  togglePause: async () => {
    await getAudioPlayer().togglePause();
  },
  prev: async () => {
    await getAudioPlayer().prev();
  },
  skip: async () => {
    await getAudioPlayer().skip();
  },
  getIsPlaying: async () => {
    console.log(get().isPlaying);
  },
}));
