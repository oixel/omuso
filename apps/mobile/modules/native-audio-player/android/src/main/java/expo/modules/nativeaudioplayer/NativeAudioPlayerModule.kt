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

      // Emit new playing state when player is played / paused
      audioSessionService?.onIsPlayingChanged = { isPlaying ->
        sendEvent("onIsPlayingChanged", mapOf("isPlaying" to isPlaying))
      }

      // Emit new playback position when player progresses
      audioSessionService?.onPositionChanged = { position, duration ->
        sendEvent(
          "onPositionChanged",
          mapOf("position" to position, "duration" to duration)
        )
      }

      // Emit new track index when track changes in player
      audioSessionService?.onTrackChanged = { index ->
        sendEvent("onTrackChanged", mapOf("index" to index))
      }
    }

    override fun onServiceDisconnected(name: ComponentName) {
      audioSessionService = null
      isBound = false
    }
  }

  // Define Expo module attributes and functionality
  override fun definition() = ModuleDefinition {
    Name("NativeAudioPlayer")

    OnCreate {
      // Grab Android's context to access system services (return out if no context exists for safety)
      val context = appContext.reactContext ?: return@OnCreate

      // Start AudioSessionService and connect to it
      val intent = Intent(context, AudioSessionService::class.java)
      context.startService(intent)
      context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    Events("onIsPlayingChanged", "onPositionChanged", "onTrackChanged")

    AsyncFunction("play") { audioSessionService?.play() }
    AsyncFunction("pause") { audioSessionService?.pause() }
    AsyncFunction("togglePause") { audioSessionService?.togglePause() }

    AsyncFunction("seekTo") { position: Long -> audioSessionService?.seekTo(position) }
    AsyncFunction("playTrack") { index: Int -> audioSessionService?.playTrack(index) }
    AsyncFunction("skip") { audioSessionService?.skip() }
    AsyncFunction("prev") { audioSessionService?.prev() }

    AsyncFunction("getIsPlaying") { audioSessionService?.getIsPlaying() }
    AsyncFunction("getPosition") { audioSessionService?.getPosition() }
    AsyncFunction("getDuration") { audioSessionService?.getDuration() }
    AsyncFunction("getTrackIndex") { audioSessionService?.getTrackIndex() }
    AsyncFunction("getPlaybackState") { audioSessionService?.getPlaybackState() }

    AsyncFunction("setQueue") { tracks: List<QueuedTrack> ->
      audioSessionService?.setQueue(tracks.map { it.toMediaItem() })
    }

    AsyncFunction("updateQueue") { tracks: List<QueuedTrack> ->
      audioSessionService?.updateQueue(tracks.map { it.toMediaItem() })
    }

    AsyncFunction("addNext") { tracks: List<QueuedTrack> ->
      audioSessionService?.addNext(tracks.map { it.toMediaItem() })
    }


    AsyncFunction("addToEnd") { tracks: List<QueuedTrack> ->
      audioSessionService?.addToEnd(tracks.map { it.toMediaItem() })
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
