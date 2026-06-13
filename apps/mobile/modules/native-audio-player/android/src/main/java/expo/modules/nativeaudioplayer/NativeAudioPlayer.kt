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

class NativeAudioPlayer(context: Context) {
    private val mainHandler = Handler(Looper.getMainLooper())
    lateinit var player: ExoPlayer

    var isPlaying: Boolean = false

    init {
        // Initialize ExoPlayer in main thread to ensure player access is on correct thread
        mainHandler.post {
            player = ExoPlayer.Builder(context).build()

            // Track state changes of the Player (Events are reported to Player.Listener)
            player.addListener(object : Player.Listener {
                override fun onIsPlayingChanged(playing: Boolean) {
                    isPlaying = playing
                }
            })

            player.prepare()
        }
    }

    fun play() = mainHandler.post { player.play() }
    fun pause() = mainHandler.post { player.pause() }
    fun togglePause() = if (isPlaying) pause() else play()

    fun skip() = mainHandler.post { player.seekToNextMediaItem() }
    fun prev() = mainHandler.post { player.seekToPreviousMediaItem() }

    // Replaces entire queue with new queue and wipes current progress
    fun setQueue(queue: List<MediaItem>) = mainHandler.post { player.setMediaItems(queue) }

    // Used to quickly update the queue without losing current track's progress
    fun updateQueue(queue: List<MediaItem>) = mainHandler.post {
        val currentIndex = player.currentMediaItemIndex  // TODO: check this does not crash due to thread error

        if (currentIndex > 0) {  // Update queue before current track
            player.replaceMediaItems(
                0,
                currentIndex,
                queue.subList(0, currentIndex)
            )
        }

        if (currentIndex + 1 < player.mediaItemCount) {  // Update queue after current track
            player.replaceMediaItems(
                currentIndex,
                player.mediaItemCount,
                queue.subList(currentIndex, player.mediaItemCount)
            )
        }
    }
}
