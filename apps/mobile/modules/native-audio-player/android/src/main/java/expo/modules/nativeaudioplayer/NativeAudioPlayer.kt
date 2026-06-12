package expo.modules.nativeaudioplayer

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NativeAudioPlayer : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeAudioPlayer")

    Function("getTest") {
      return@Function "Hello, CarCar!"
    }
  }
}
