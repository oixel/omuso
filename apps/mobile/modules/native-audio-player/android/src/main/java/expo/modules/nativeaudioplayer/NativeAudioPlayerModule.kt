package expo.modules.nativeaudioplayer

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

//
// Thin bridge layer that defines the Expo module (native-audio-player)
// Receives events from JS files and communicates to AudioSessionService.kt
// Receives events from AudioSessionService.kt and passes it JS files
//

class NativeAudioPlayerModule : Module() {
  private var audioSessionService: AudioSessionService? = null
  private var isBound: Boolean = false

  // Define callbacks for service binding
  private val connection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName, binder: IBinder) {
      // Bind to AudioSessionService and get its current instance
      val localBinder = binder as AudioSessionService.LocalBinder
      audioSessionService = localBinder.getService()
      isBound = true

      // Emit new playback state when player's state changes
      audioSessionService?.onPlaybackStateChanged = { playbackState ->
        sendEvent("onPlaybackStateChanged", mapOf("playbackState" to playbackState))
      }

      // Emit new playing state when player is played / paused
      audioSessionService?.onIsPlayingChanged = { isPlaying ->
        sendEvent("onIsPlayingChanged", mapOf("isPlaying" to isPlaying))
      }

      // Emit new playback position when player progresses
      audioSessionService?.onPositionChanged = { position ->
        sendEvent("onPositionChanged", mapOf("position" to position))
      }

      // Emit new song duration when song changes
      audioSessionService?.onDurationChanged = { duration -> 
        sendEvent("onDurationChanged", mapOf("duration" to duration))
      }

      // Emit new song index when song changes in player
      audioSessionService?.onSongChanged = { index ->
        sendEvent("onSongChanged", mapOf("index" to index))
      }

      audioSessionService?.onPlayerDestroyed = { sendEvent("onPlayerDestroyed") }
    }

    override fun onServiceDisconnected(name: ComponentName) {
      audioSessionService = null
      isBound = false
    }
  }

  // Define Expo module attributes and functionality
  override fun definition() = ModuleDefinition {
    Name("NativeAudioPlayer")

    Events(
      "onPlayerDestroyed",
      "onPlaybackStateChanged",
      "onIsPlayingChanged",
      "onPositionChanged",
      "onDurationChanged",
      "onSongChanged"
    )

    // Start AudioSessionService and connect to it, but do not return until fully initialized
    AsyncFunction("initialize") {
      val context = appContext.reactContext
      if (context != null) {
        val intent = Intent(context, AudioSessionService::class.java)
        context.startService(intent)
        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
      }
    }

    AsyncFunction("destroy") {
      audioSessionService?.destroy()

      if (isBound) {
        appContext.reactContext?.unbindService(connection)
        isBound = false
      }

      audioSessionService = null
    }

    AsyncFunction("play") { audioSessionService?.play() }
    AsyncFunction("pause") { audioSessionService?.pause() }
    AsyncFunction("togglePause") { audioSessionService?.togglePause() }

    AsyncFunction("seekTo") { position: Long -> audioSessionService?.seekTo(position) }
    AsyncFunction("playSong") { index: Int -> audioSessionService?.playSong(index) }
    AsyncFunction("skip") { audioSessionService?.skip() }
    AsyncFunction("prev") { audioSessionService?.prev() }

    AsyncFunction("getIsPlaying") { audioSessionService?.getIsPlaying() }
    AsyncFunction("getPosition") { audioSessionService?.getPosition() }
    AsyncFunction("getDuration") { audioSessionService?.getDuration() }
    AsyncFunction("getSongIndex") { audioSessionService?.getSongIndex() }
    AsyncFunction("getPlaybackState") { audioSessionService?.getPlaybackState() }

    AsyncFunction("setQueue") { songs: List<QueuedSong> ->
      audioSessionService?.setQueue(songs.map { it.toMediaItem() })
    }

    AsyncFunction("updateQueue") { songs: List<QueuedSong> ->
      audioSessionService?.updateQueue(songs.map { it.toMediaItem() })
    }

    AsyncFunction("addNext") { songs: List<QueuedSong> ->
      audioSessionService?.addNext(songs.map { it.toMediaItem() })
    }


    AsyncFunction("addToEnd") { songs: List<QueuedSong> ->
      audioSessionService?.addToEnd(songs.map { it.toMediaItem() })
    }

    AsyncFunction("removeFromQueue") { start: Int, end: Int? ->
      audioSessionService?.removeFromQueue(start, end)
    }

    OnDestroy {
      if (isBound) {
        appContext.reactContext?.unbindService(connection)
        isBound = false
      }
    }
  }
}
