package expo.modules.nativeaudioplayer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NativeAudioPlayer : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeAudioPlayer")

    OnCreate {
      println("TODO: Bind to serive")
    }

    Function("setTest") { test: String ->
      println(test)
    }

    Function("getTest") {
      return@Function "Hello, CarCar!"
    }

    OnDestroy {
      println("TODO: Unbind from service")
    }
  }
}
