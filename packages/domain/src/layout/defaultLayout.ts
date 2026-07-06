import type { ComponentDefinition } from '@choral/types';

export const COMPONENTS: ComponentDefinition[] = [
  {
    id: 'coverArt',
    label: 'Cover Art',
    description: "Displays the current track's album art.",
    minWidth: 2,
    minHeight: 2,
    scaleRatio: 'square',
    defaultOptions: {
      border: 0,
      cornerRadius: 0,
    },
  },
  {
    id: 'playbackButton',
    label: 'Playback Button',
    description: 'Controls part of the music playback.',
    minWidth: 1,
    minHeight: 1,
    scaleRatio: 'square',
    defaultOptions: {
      functionality: 'togglePause',
    },
  },
];
