import type { AudioPlayer } from '@omuso/types';

let audioPlayer: AudioPlayer | null = null;

export async function registerAudioPlayer(player: AudioPlayer) {
  if (!audioPlayer) {
    await player.initialize();
    audioPlayer = player;
  }
}

export function getAudioPlayer(): AudioPlayer {
  if (!audioPlayer) throw new Error('No audio player currently registered.');
  return audioPlayer;
}

export function destroyAudioPlayer() {
  audioPlayer?.pause();
  audioPlayer?.destroy();
  audioPlayer = null;
}
