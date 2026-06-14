package expo.modules.nativeaudioplayer

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import androidx.media3.common.MediaItem
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

      // Connect a listener to NativeAudioPlayer's play state change
      audioSessionService?.onIsPlayingChanged = { isPlaying ->
        println("On module, isPlaying has been updated to $isPlaying")
        sendEvent("onIsPlayingChanged", mapOf("isPlaying" to isPlaying))
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

    Events("onIsPlayingChanged")

    AsyncFunction("play") { audioSessionService?.play() }
    AsyncFunction("pause") { audioSessionService?.pause() }
    AsyncFunction("togglePause") { audioSessionService?.togglePause() }
    AsyncFunction("isPlaying") { audioSessionService?.isPlaying() ?: false }
    AsyncFunction("skip") { audioSessionService?.skip() }
    AsyncFunction("prev") { audioSessionService?.prev() }

    AsyncFunction("setQueue") { tracks: List<Track> ->
      audioSessionService?.setQueue(tracks.map { it.toMediaItem() })
    }

    AsyncFunction("updateQueue") { tracks: List<Track> ->
      audioSessionService?.updateQueue(tracks.map { it.toMediaItem() })
    }

    AsyncFunction("addNext") { track: Track ->
      audioSessionService?.addNext(track.toMediaItem())
    }

    AsyncFunction("addNext") { tracks: List<Track> ->
      audioSessionService?.addNext(tracks.map { it.toMediaItem() })
    }

    AsyncFunction("addToEnd") { track: Track ->
      audioSessionService?.addToEnd(track.toMediaItem())
    }

    AsyncFunction("addToEnd") { tracks: List<Track> ->
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
