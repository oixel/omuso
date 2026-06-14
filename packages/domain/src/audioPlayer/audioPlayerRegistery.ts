import type { AudioPlayer } from '@choral/types';

let audioPlayer: AudioPlayer | null = null;

export function registerAudioPlayer(player: AudioPlayer) {
  audioPlayer = player;
}

export function getAudioPlayer(): AudioPlayer {
  if (!audioPlayer) throw new Error('No audio player currently registered.');
  return audioPlayer;
}
