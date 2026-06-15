import { create } from 'zustand';
import { getAudioPlayer } from './audioPlayerRegistery';
import { PlaybackStore } from '@choral/types';

//
// Consumed by UI to get / alter AudioPlayer's state
//

// Does not use set / get since this store is event-driven using listeners to ensure that states are in sync
export const usePlayback = create<PlaybackStore>()((_set, _get) => ({
  isPlaying: false,
  isBuffering: false,
  position: 0,
  duration: 0,

  play: async () => {
    await getAudioPlayer().play();
  },
  pause: async () => {
    await getAudioPlayer().pause();
  },
  togglePause: async () => {
    await getAudioPlayer().togglePause();
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
}));
