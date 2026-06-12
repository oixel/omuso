//
// Handle Android's MediaSessionService functionality
//

// https://developer.android.com/media/media3/session/background-playback
// Important: Lifecycle functionality: (override) onCreate(), onDestroy() and onTaskRemoved()
// OnTaskRemoved() Pause player (if one exists player?.pause()) rather than deleting it from media center entirely
    // This aligns with Apple Music's behavior (?)