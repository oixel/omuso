package expo.modules.nativeaudioplayer

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.net.Uri
import android.os.IBinder
import androidx.core.os.bundleOf
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import androidx.core.net.toUri

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
    }

    override fun onServiceDisconnected(name: ComponentName) {
      audioSessionService = null
      isBound = false
    }
  }

  // Converts list of JavaScript's Track objects to list of Android MediaItems
  private fun convertToQueue(trackRecords: List<TrackRecord>): List<MediaItem> {
    return trackRecords.map { track ->
      MediaItem.Builder()
        .setMediaId(track.id)
        .setUri(track.uri)
        .setMediaMetadata(
          MediaMetadata.Builder()
            .setTitle(track.title)
            .setArtist(track.artist)
            .setAlbumTitle(track.album)
            .setArtworkUri(track.coverArtUri?.toUri())
            .build()
        )
        .build()
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

    AsyncFunction("play") { audioSessionService?.play() }
    AsyncFunction("pause") { audioSessionService?.pause() }
    AsyncFunction("togglePause") { audioSessionService?.togglePause() }
    AsyncFunction("isPlaying") { audioSessionService?.isPlaying() ?: false }
    AsyncFunction("skip") { audioSessionService?.skip() }
    AsyncFunction("prev") { audioSessionService?.prev() }

    AsyncFunction("setQueue") { trackRecords: List<TrackRecord> ->
      val queue: List<MediaItem> = convertToQueue(trackRecords);
      audioSessionService?.setQueue(queue)
    }

    AsyncFunction("updateQueue") { trackRecords: List<TrackRecord> ->
      val queue: List<MediaItem> = convertToQueue(trackRecords);
      audioSessionService?.updateQueue(queue)
    }

    //
    // TODO: REMOVE DEBUG FUNCTIONS
    //

    Events("onSetTest")

    Function("setTest") { message: String ->
      println("setTest called with: $message")
      this@NativeAudioPlayerModule.sendEvent("onSetTest", bundleOf("message" to "OVERWRITTEN MWAHAHA"))
    }

    Function("getTest") {
      return@Function "Hello, CarCar!"
    }

    OnDestroy {
      if (isBound) {
        appContext.reactContext?.unbindService(connection)
        isBound = false
      }
    }
  }
}
