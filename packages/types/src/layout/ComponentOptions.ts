//
// Defines the customizable options for each existing component
//
export interface ComponentOptions {
  coverArt: {
    border: number;
    cornerRadius: number;
  };
  playbackButton: {
    functionality:
      | 'togglePause'
      | 'play'
      | 'pause'
      | 'stop'
      | 'seekBack'
      | 'seekForward'
      | 'prev'
      | 'skip'
      | 'shuffle'
      | 'repeat'
      | 'star';
    seekSeconds?: number; // How many seconds seekBack/Forward should skip
  };
}
