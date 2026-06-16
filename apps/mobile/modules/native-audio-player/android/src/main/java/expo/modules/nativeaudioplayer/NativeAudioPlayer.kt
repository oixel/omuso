package expo.modules.nativeaudioplayer

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer

//
// Implements Android's ExpoPlayer
// Simply takes events and input from AudioSessionService.kt
//

class NativeAudioPlayer(context: Context, onReady: (ExoPlayer) -> Unit) {
    private val mainHandler = Handler(Looper.getMainLooper())
    lateinit var player: ExoPlayer

    var playbackState: String = "STATE_IDLE"
    var isPlaying: Boolean = false
    var position: Long = 0L
    var duration: Long = 0L
    var trackIndex: Int = 0

    var onIsPlayingChanged: ((Boolean) -> Unit)? = null
    var onPositionChanged: ((Long, Long) -> Unit)? = null
    var onTrackChanged: ((Int) -> Unit)? = null

    // Poll current track progress periodically to update app UI
    private val progressHandler = Handler(Looper.getMainLooper())
    private val progressRunnable = object : Runnable {
        override fun run() {
            position = player.currentPosition
            duration = player.duration
            onPositionChanged?.invoke(position, duration)
            progressHandler.postDelayed(this, 500)
        }
    }

    fun startPollingProgress() { progressHandler.post(progressRunnable) }
    fun stopPollingProgress() { progressHandler.removeCallbacks(progressRunnable)}

    init {
        // Initialize ExoPlayer in main thread to ensure player access is on correct thread
        mainHandler.post {
            player = ExoPlayer.Builder(context).build()

            // Track state changes of the Player (Events are reported to Player.Listener)
            player.addListener(object : Player.Listener {
                override fun onIsPlayingChanged(playing: Boolean) {
                    isPlaying = playing
                    onIsPlayingChanged?.invoke(playing)

                    // Only poll progress when progress occurs
                    if (playing) startPollingProgress() else stopPollingProgress()
                }

                override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                    trackIndex = player.currentMediaItemIndex
                    onTrackChanged?.invoke(player.currentMediaItemIndex)
                }

                override fun onPlaybackStateChanged(stateInt: Int) {
                    playbackState = when (stateInt) {
                        Player.STATE_IDLE -> "IDLE"
                        Player.STATE_BUFFERING -> "BUFFERING"
                        Player.STATE_READY -> "READY"
                        Player.STATE_ENDED -> "ENDED"
                        else -> "UNKNOWN"
                    }
                }
            })

            onReady(player)
        }
    }

    fun release() {
        stopPollingProgress()
        mainHandler.post { player.release() }
    }

    fun play() = mainHandler.post { player.play() }
    fun pause() = mainHandler.post { player.pause() }
    fun togglePause() = if (isPlaying) pause() else play()

    fun seekTo(position: Long) = mainHandler.post { player.seekTo(position) }
    fun playTrack(index: Int) = mainHandler.post { player.seekTo(index, 0L)}
    fun skip() = mainHandler.post { player.seekToNextMediaItem() }
    fun prev() = mainHandler.post { player.seekToPreviousMediaItem() }

    // Replaces entire queue with new queue and wipes current progress
    fun setQueue(queue: List<MediaItem>) = mainHandler.post {
        if (player.playbackState != Player.STATE_READY) player.prepare()
        player.setMediaItems(queue)
    }

    // Used to quickly update the queue without losing current track's progress (e.g. reordering tracks)
    fun updateQueue(queue: List<MediaItem>) = mainHandler.post {
        player.replaceMediaItems(0, player.mediaItemCount, queue)
//        val currentIndex = player.currentMediaItemIndex
//
//        if (currentIndex > 0) {  // Update queue before current track
//            player.replaceMediaItems(
//                0,
//                currentIndex,
//                queue.subList(0, currentIndex)
//            )
//        }
//
//        if (currentIndex + 1 < player.mediaItemCount) {  // Update queue after current track
//            player.replaceMediaItems(
//                currentIndex + 1,
//                player.mediaItemCount,
//                queue.subList(currentIndex + 1, player.mediaItemCount)
//            )
//        }
    }

    fun addNext(mediaItems: List<MediaItem>) = mainHandler.post {
        player.addMediaItems(player.currentMediaItemIndex + 1, mediaItems)
    }

    fun addToEnd(mediaItems: List<MediaItem>) = mainHandler.post {
        player.addMediaItems(mediaItems)
    }

    // Remove a single media item or a range if an end is provided
    fun removeFromQueue(start: Int, end: Int?) = mainHandler.post {
        player.removeMediaItems(
            start,
            if (end != null) end + 1 else start + 1
        )
    }
}
