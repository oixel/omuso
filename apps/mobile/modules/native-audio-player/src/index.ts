import { EventSubscription } from 'expo-modules-core';
import NativeAudioPlayerModule from './NativeAudioPlayerModule';
import { SetTestEvent } from './NativeAudioPlayer.types';

export function addSetTestListener(listener: (event: SetTestEvent) => void): EventSubscription {
  return NativeAudioPlayerModule.addListener('onSetTest', listener);
}

export function getTest(): string {
  return NativeAudioPlayerModule.getTest();
}

export function setTest(test: string): void {
  NativeAudioPlayerModule.setTest(test);
}
