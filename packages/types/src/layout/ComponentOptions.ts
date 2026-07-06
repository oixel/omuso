//
// Defines the customizable options for each existing component
//
export interface ComponentOptions {
  coverArt: {
    border: number;
    cornerRadius: number;
  };
  controls: {
    showShuffle: boolean;
    showRepeat: boolean;
    showStar: boolean;
    spacing: number;
  };
}
