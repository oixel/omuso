package expo.modules.nativeaudioplayer

import android.content.Context
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer

//
// Implements Android's ExpoPlayer
// Simply takes events and input from AudioSessionService.kt
//

class NativeAudioPlayer(context: Context) {
    val player = ExoPlayer.Builder(context).build()

    private var _isPlaying: Boolean = false

    init {
        // Track state changes of the Player (Events are reported to Player.Listener)
        player.addListener(object: Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                _isPlaying = isPlaying
            }
        })
    }

    fun play() = player.play()
    fun pause() = player.pause()
    fun togglePause() = if (_isPlaying) play() else pause()
    fun isPlaying() = _isPlaying

    fun skip() = player.seekToNextMediaItem()
    fun prev() = player.seekToPreviousMediaItem()
}
