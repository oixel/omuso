import { ScreenLayout } from './ScreenLayout';

//
// Define the existing screens
//

export interface ChoralLayout {
  version: string;
  customizableScreens: {
    home: ScreenLayout; // First screen that the app opens up to
    player: ScreenLayout; // Pramariy place for user to control playback
    queue: ScreenLayout; // Current playback queue
    library: ScreenLayout; // Contains all content in server
    search: ScreenLayout; // Bar / results
    artist: ScreenLayout; // View of an artist's info / discography
    album: ScreenLayout; // View for a album's tracklist
    playlist: ScreenLayout; // View a playlist's tracklist
  };
  fixedScreens: {
    // These screens cannot have their configurations altered by a user, only choral-theme CSS var theming gets applied
    login: ScreenLayout;
    settings: ScreenLayout;
  };
}
