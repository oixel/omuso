package expo.modules.nativeaudioplayer

import android.content.Intent
import android.os.Binder
import android.os.IBinder
import androidx.media3.common.MediaItem
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

//
// Handle Android's MediaSessionService implementation
// Takes event from NativeAudioPlayerModule.kt and controls NativeAudioPlayer.kt
// Passes event from MediaSession back to NativeAudioPlayerModule.kt
//

// https://developer.android.com/media/media3/session/background-playback
// Important: Lifecycle functionality: (override) onCreate(), onDestroy() and onTaskRemoved()
// OnTaskRemoved() Pause player (if one exists player?.pause()) rather than deleting it from media center entirely
    // This aligns with Apple Music's behavior (?)

// TODO: on AudioSessionService's Destroy, ExoPlayer.release

class AudioSessionService : MediaSessionService() {
    //
    // Binding to NativeAudioModule
    //

    // Binder given to NativeAudioPlayerModule
    private val binder = LocalBinder()

    // Return this instance of LocalService so NativeAudioPlayerModule can call public methods
    inner class LocalBinder : Binder() {
        fun getService(): AudioSessionService = this@AudioSessionService
    }

    override fun onBind(intent: Intent?): IBinder? {
        return if (intent?.action == SERVICE_INTERFACE) {
            // Ensure external MediaBrowser client (e.g. Android Auto or Assistant)
            // can still connect to MediaSessionService's binder
            super.onBind(intent)
        }
        else {  // No intent action -> bind locally to this service (NativeAudioPlayerModule)
            binder
        }
    }

    //
    // MediaSession functionality
    //

    private lateinit var nativeAudioPlayer: NativeAudioPlayer

    override fun onCreate() {
        super.onCreate()
        nativeAudioPlayer = NativeAudioPlayer(this)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        TODO("Not yet implemented")
    }

    // Delegate audio player controls to the audio player
    fun play() = nativeAudioPlayer.play()
    fun pause() = nativeAudioPlayer.pause()
    fun togglePause() = nativeAudioPlayer.togglePause()
    fun isPlaying(): Boolean = nativeAudioPlayer.isPlaying
    fun skip() = nativeAudioPlayer.skip()
    fun prev() = nativeAudioPlayer.prev()

    //
    fun setQueue(queue: List<MediaItem>) = nativeAudioPlayer.setQueue(queue)
    fun updateQueue(queue: List<MediaItem>) = nativeAudioPlayer.updateQueue(queue)
}