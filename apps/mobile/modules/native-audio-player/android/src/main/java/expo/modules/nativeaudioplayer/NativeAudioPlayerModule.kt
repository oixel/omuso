package expo.modules.nativeaudioplayer

import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NativeAudioPlayerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeAudioPlayer")

     OnCreate {
      println("TODO: Bind to service")
    }

    Events("onSetTest")

    Function("setTest") { message: String ->
      println("setTest called with: $message")
      this@NativeAudioPlayerModule.sendEvent("onSetTest", bundleOf("message" to "OVERWRITTEN MWAHAHA"))
    }

    Function("getTest") {
      return@Function "Hello, CarCar!"
    }

    OnDestroy {
      // unbind from MusicSessionService
      // remove any listeners or callbacks registered on the service
      // release the service connection object
      println("TODO: Unbind from service")
    }
  }
}
