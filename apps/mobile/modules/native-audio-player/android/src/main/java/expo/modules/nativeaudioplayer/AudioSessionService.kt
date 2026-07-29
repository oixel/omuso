package expo.modules.nativeaudioplayer

import android.app.PendingIntent
import android.content.ComponentName
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import androidx.media3.common.MediaItem
import androidx.media3.session.MediaController
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.MoreExecutors
import kotlin.jvm.java

//
// Handle Android's MediaSessionService implementation
// Takes event from NativeAudioPlayerModule.kt and controls NativeAudioPlayer.kt
// Passes event from MediaSession back to NativeAudioPlayerModule.kt
//

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
    private var mediaSession: MediaSession? = null

    // Event listeners for the audio player
    var onPlayerDestroyed: (() -> Unit)? = null
    var onPlaybackStateChanged: ((String) -> Unit)? = null
    var onIsPlayingChanged: ((Boolean) -> Unit)? = null
    var onPositionChanged: ((Long, Long) -> Unit)? = null
    var onSongChanged: ((Int) -> Unit)? = null

    override fun onCreate() {
        super.onCreate()

        // Initialize audio player, and then build a media session from it
        nativeAudioPlayer = NativeAudioPlayer(this) { player ->
            val appActivityIntent = packageManager?.getLaunchIntentForPackage(packageName)
                ?.let { intent -> PendingIntent.getActivity(
                    this,
                    0,
                    intent,
                    PendingIntent.FLAG_IMMUTABLE
                ) }

            mediaSession = MediaSession.Builder(this, player)
                .setSessionActivity(appActivityIntent!!)
                .build()
        }

        nativeAudioPlayer.onPlayerDestroyed = { onPlayerDestroyed?.invoke() }
        nativeAudioPlayer.onPlaybackStateChanged = { playbackState -> onPlaybackStateChanged?.invoke(playbackState) }
        nativeAudioPlayer.onIsPlayingChanged = { playing -> onIsPlayingChanged?.invoke(playing) }
        nativeAudioPlayer.onPositionChanged = { position, duration ->
            onPositionChanged?.invoke(position, duration)
        }
        nativeAudioPlayer.onSongChanged = { index -> onSongChanged?.invoke(index) }
    }

    // Connect media session's controller info to the new session
    override fun onGetSession(
        controllerInfo: MediaSession.ControllerInfo
    ): MediaSession? = mediaSession

    override fun onStart(intent: Intent?, startId: Int) {
        super.onStart(intent, startId)

        // Create MediaController (notification / lock screen controller) and connect listeners
        val sessionToken = SessionToken(this, ComponentName(this, this::class.java))
        val controllerFuture = MediaController.Builder(this, sessionToken).buildAsync()
        controllerFuture.addListener(
            {},
            MoreExecutors.directExecutor()
        )
    }

    // Pause player rather than deleting it from media center when app is removed from recents
    // This aligns with other music player's behavior
    override fun onTaskRemoved(rootIntent: Intent?) {
        super.onTaskRemoved(rootIntent)
        nativeAudioPlayer.pause()
    }

    fun releaseMediaSession() = mediaSession?.run {
        nativeAudioPlayer.release()
        release()
        mediaSession = null
    }

    fun destroy() {
        releaseMediaSession()

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        releaseMediaSession()
        super.onDestroy()
    }

    // Delegate audio player controls to the Module for export
    fun play() = nativeAudioPlayer.play()
    fun pause() = nativeAudioPlayer.pause()
    fun togglePause() = nativeAudioPlayer.togglePause()

    fun seekTo(position: Long) = nativeAudioPlayer.seekTo(position)
    fun playSong(index: Int) = nativeAudioPlayer.playSong(index)
    fun skip() = nativeAudioPlayer.skip()
    fun prev() = nativeAudioPlayer.prev()

    fun getIsPlaying() = nativeAudioPlayer.isPlaying
    fun getPosition() = nativeAudioPlayer.position
    fun getDuration() = nativeAudioPlayer.duration
    fun getSongIndex() = nativeAudioPlayer.songIndex
    fun getPlaybackState() = nativeAudioPlayer.playbackState

    // Delegate queue controls to the Module for export
    fun setQueue(queue: List<MediaItem>) = nativeAudioPlayer.setQueue(queue)
    fun updateQueue(queue: List<MediaItem>) = nativeAudioPlayer.updateQueue(queue)
    fun addNext(mediaItems: List<MediaItem>) = nativeAudioPlayer.addNext(mediaItems)
    fun addToEnd(mediaItems: List<MediaItem>) = nativeAudioPlayer.addToEnd(mediaItems)
    fun removeFromQueue(start: Int, end: Int?) = nativeAudioPlayer.removeFromQueue(start, end)
}