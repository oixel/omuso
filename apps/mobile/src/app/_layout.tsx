import '../../global.css'

import { Asset } from 'expo-asset'
import TrackPlayer, { PlayerCommand, type MediaItem } from '@rntp/player'
import { useEffect } from 'react'
import { Stack } from 'expo-router'

export default function RootLayout() {
  useEffect(() => {
    async function init() {
      const songAsset = await Asset.fromModule(
        require('../../assets/03-the-feeling.mp3')
      ).downloadAsync()

      try {
        await TrackPlayer.setupPlayer({
          contentType: 'music',
          android: {
            wakeMode: 'network',
            taskRemovedBehavior: 'stop',
            notification: {
              channelId: 'com.choral.audio',
              channelName: 'Choral Music Playback',
              smallIcon: 'ic_stat_music_note',
            },
          },
        })
      } catch {
        // Continue without rebuilding the TrackPlayer
      }

      const testSong: MediaItem = {
        mediaId: 'the feeling',
        url: songAsset.localUri as string,
        title: 'the feeling',
        artist: 'Steve Lacy',
        albumTitle: 'Oh yeah?',
        mimeType: 'audio/mp3',
      }

      await TrackPlayer.setCommands({
        capabilities: [
          PlayerCommand.PlayPause,
          PlayerCommand.Previous,
          PlayerCommand.Next,
          PlayerCommand.Seek,
        ],
      })

      await TrackPlayer.setMediaItems([testSong, testSong])

      await TrackPlayer.play()
    }

    init()
  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}
